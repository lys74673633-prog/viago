import { NextResponse } from "next/server";
import { AiClientError, generateJson, getAiProvider } from "@/lib/ai/client";
import { buildDemoSetukVersions } from "@/lib/ai/demo-setuk";
import { buildSetukPrompt } from "@/lib/ai/prompts";
import { consumeQuota, quotaExceededResponse } from "@/lib/usage/quota";
import type { SetukInput, SetukVersion } from "@/types";

const SYSTEM =
  "당신은 한국 고등학생 생기부 세특 작성 전문가입니다. 각 역량별 3~5문장의 구체적 세특을 JSON으로만 출력하세요.";

export async function POST(request: Request) {
  let body: Partial<SetukInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const input: SetukInput = {
    subject: body.subject?.trim() ?? "",
    keywords: body.keywords?.trim() ?? "",
    roleAndReflection: body.roleAndReflection?.trim() ?? "",
  };

  if (!input.subject || !input.keywords || !input.roleAndReflection) {
    return NextResponse.json(
      { error: "과목, 키워드, 역할 및 느낀 점을 모두 입력해 주세요." },
      { status: 400 },
    );
  }

  const quota = await consumeQuota();
  if (!quota.ok) {
    return NextResponse.json(quotaExceededResponse(quota), { status: 402 });
  }

  const provider = getAiProvider();
  if (!provider) {
    return NextResponse.json({
      versions: buildDemoSetukVersions(input),
      remaining: quota.remaining,
      limit: quota.limit,
      provider: "demo",
    });
  }

  try {
    const versions = await generateSetukVersions(input);
    return NextResponse.json({
      versions,
      remaining: quota.remaining,
      limit: quota.limit,
      provider,
    });
  } catch (err) {
    // 상용 키가 깨져도 세특 페이지가 죽지 않도록 데모로 폴백
    const versions = buildDemoSetukVersions(input);
    return NextResponse.json({
      versions,
      remaining: quota.remaining,
      limit: quota.limit,
      provider: "demo",
      warning:
        err instanceof AiClientError
          ? err.message
          : "AI 호출에 실패해 데모 문장을 반환했습니다.",
    });
  }
}

async function generateSetukVersions(input: SetukInput): Promise<SetukVersion[]> {
  const json = await generateJson<{
    academic: string;
    career: string;
    community: string;
  }>(SYSTEM, buildSetukPrompt(input), { maxTokens: 2200, temperature: 0.55 });

  if (!json.academic || !json.career || !json.community) {
    throw new AiClientError("세특 결과 형식이 올바르지 않습니다.");
  }

  return [
    {
      type: "academic",
      label: "학업 역량",
      description: "탐구·분석·개념 이해 중심",
      content: json.academic,
    },
    {
      type: "career",
      label: "진로 역량",
      description: "관심 분야·진로 연결 중심",
      content: json.career,
    },
    {
      type: "community",
      label: "공동체 역량",
      description: "협력·소통·기여 중심",
      content: json.community,
    },
  ];
}
