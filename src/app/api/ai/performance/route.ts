import { NextResponse } from "next/server";
import { AiClientError, generateJson, getAiProvider } from "@/lib/ai/client";
import { buildDemoExpand, buildDemoTopics } from "@/lib/ai/demo-performance";
import {
  buildPerformanceExpandPrompt,
  buildPerformanceTopicsPrompt,
} from "@/lib/ai/prompts";
import { consumeQuota, quotaExceededResponse } from "@/lib/usage/quota";
import type {
  PerformanceAction,
  PerformanceExpandResult,
  PerformanceTopicInput,
  RecommendedTopic,
} from "@/types";

const SYSTEM_TOPICS =
  "당신은 한국 고등학생 수행평가 주제 기획 전문가입니다. 유효한 JSON만 출력하세요.";

const SYSTEM_EXPAND =
  "당신은 한국 고등학교 수행평가 롱폼 보고서 지도 교사입니다. 서론-이론-방법-결과-결론 구조의 방대한 보고서를 JSON으로만 출력하세요. reportDraft는 반드시 1800자 이상이어야 합니다.";

interface PerformanceBody extends Partial<PerformanceTopicInput> {
  action?: PerformanceAction;
  selectedTopic?: string;
}

export async function POST(request: Request) {
  let body: PerformanceBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const action: PerformanceAction = body.action === "expand" ? "expand" : "topics";
  const unit = body.unit?.trim() ?? "";
  const keywords = body.keywords?.trim() ?? "";
  const selectedTopic = body.selectedTopic?.trim() ?? "";

  if (!unit || !keywords) {
    return NextResponse.json(
      { error: "교과 단원과 주제 키워드를 입력해 주세요." },
      { status: 400 },
    );
  }

  if (action === "expand" && !selectedTopic) {
    return NextResponse.json(
      { error: "보고서/대본을 만들 주제를 선택해 주세요." },
      { status: 400 },
    );
  }

  const quota = await consumeQuota();
  if (!quota.ok) {
    return NextResponse.json(quotaExceededResponse(quota), { status: 402 });
  }

  const input: PerformanceTopicInput = { unit, keywords };
  const provider = getAiProvider();

  if (!provider) {
    if (action === "topics") {
      return NextResponse.json({
        action,
        topics: buildDemoTopics(input),
        remaining: quota.remaining,
        limit: quota.limit,
        provider: "demo",
      });
    }
    return NextResponse.json({
      action,
      result: buildDemoExpand(input, selectedTopic),
      remaining: quota.remaining,
      limit: quota.limit,
      provider: "demo",
    });
  }

  try {
    if (action === "topics") {
      const topics = await generateTopics(input);
      return NextResponse.json({
        action,
        topics,
        remaining: quota.remaining,
        limit: quota.limit,
        provider,
      });
    }

    const result = await generateExpand({ ...input, selectedTopic });
    return NextResponse.json({
      action,
      result,
      remaining: quota.remaining,
      limit: quota.limit,
      provider,
    });
  } catch (err) {
    if (action === "topics") {
      return NextResponse.json({
        action,
        topics: buildDemoTopics(input),
        remaining: quota.remaining,
        limit: quota.limit,
        provider: "demo",
        warning:
          err instanceof AiClientError
            ? err.message
            : "AI 호출 실패로 데모 주제를 반환했습니다.",
      });
    }
    return NextResponse.json({
      action,
      result: buildDemoExpand(input, selectedTopic),
      remaining: quota.remaining,
      limit: quota.limit,
      provider: "demo",
      warning:
        err instanceof AiClientError
          ? err.message
          : "AI 호출 실패로 데모 보고서를 반환했습니다.",
    });
  }
}

async function generateTopics(input: PerformanceTopicInput): Promise<RecommendedTopic[]> {
  const json = await generateJson<{ topics: RecommendedTopic[] }>(
    SYSTEM_TOPICS,
    buildPerformanceTopicsPrompt(input),
    { maxTokens: 1500, temperature: 0.7 },
  );

  const topics = (json.topics ?? []).slice(0, 5).map((t, i) => ({
    id: t.id || `t${i + 1}`,
    title: t.title,
    hook: t.hook,
    angle: t.angle,
  }));

  if (topics.length < 5 || topics.some((t) => !t.title)) {
    throw new AiClientError("주제 추천 결과가 불완전합니다. 다시 시도해 주세요.");
  }

  return topics;
}

async function generateExpand(
  input: PerformanceTopicInput & { selectedTopic: string },
): Promise<PerformanceExpandResult> {
  const json = await generateJson<PerformanceExpandResult>(
    SYSTEM_EXPAND,
    buildPerformanceExpandPrompt(input),
    { maxTokens: 4500, temperature: 0.55 },
  );

  if (!json.reportDraft || json.reportDraft.replace(/\s/g, "").length < 800) {
    throw new AiClientError(
      "보고서 분량이 제출용 기준에 미달합니다. 다시 생성해 주세요.",
    );
  }

  if (!json.speechScript) {
    throw new AiClientError("발표 대본이 비어 있습니다.");
  }

  return {
    topicTitle: json.topicTitle || input.selectedTopic,
    reportDraft: json.reportDraft,
    speechScript: json.speechScript,
    references: json.references ?? [],
  };
}
