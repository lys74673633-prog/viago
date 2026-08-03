import { NextResponse } from "next/server";
import { AiClientError, generateJson, getAiProvider } from "@/lib/ai/client";
import { buildCleanPrompt } from "@/lib/ai/prompts";

const SYSTEM =
  "당신은 한국 고교 생기부·수행평가 문장 독창화 전문가입니다. JSON만 출력하세요.";

export async function POST(request: Request) {
  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const text = body.text?.trim() ?? "";
  if (!text || text.length < 20) {
    return NextResponse.json(
      { error: "클리닝할 문장을 충분히 입력해 주세요." },
      { status: 400 },
    );
  }

  if (!getAiProvider()) {
    return NextResponse.json(
      {
        error: "AI_NOT_CONFIGURED",
        message: "OPENAI_API_KEY 또는 GEMINI_API_KEY가 필요합니다.",
      },
      { status: 503 },
    );
  }

  try {
    const json = await generateJson<{ cleaned: string }>(
      SYSTEM,
      buildCleanPrompt(text),
      { maxTokens: 2000, temperature: 0.5 },
    );
    if (!json.cleaned?.trim()) {
      throw new AiClientError("클리닝 결과가 비어 있습니다.");
    }
    return NextResponse.json({
      cleaned: json.cleaned.trim(),
      provider: getAiProvider(),
    });
  } catch (err) {
    const message =
      err instanceof AiClientError ? err.message : "클리닝 중 오류가 발생했습니다.";
    return NextResponse.json(
      { error: message },
      { status: err instanceof AiClientError ? err.status : 500 },
    );
  }
}
