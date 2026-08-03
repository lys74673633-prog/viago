import { NextResponse } from "next/server";
import { AiClientError, generateJson, getAiProvider } from "@/lib/ai/client";
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

  if (!getAiProvider()) {
    return NextResponse.json(
      {
        error: "AI_NOT_CONFIGURED",
        message:
          "OPENAI_API_KEY 또는 GEMINI_API_KEY가 없습니다. .env.local에 키를 넣고 서버를 재시작하세요.",
      },
      { status: 503 },
    );
  }

  const quota = await consumeQuota();
  if (!quota.ok) {
    return NextResponse.json(quotaExceededResponse(quota), { status: 402 });
  }

  try {
    const versions = await generateSetukVersions(input);
    return NextResponse.json({
      versions,
      remaining: quota.remaining,
      limit: quota.limit,
      provider: getAiProvider(),
    });
  } catch (err) {
    const message =
      err instanceof AiClientError ? err.message : "세특 생성 중 오류가 발생했습니다.";
    return NextResponse.json(
      { error: message, remaining: quota.remaining, limit: quota.limit },
      { status: err instanceof AiClientError ? err.status : 500 },
    );
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
