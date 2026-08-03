export class AiClientError extends Error {
  constructor(
    message: string,
    public status = 502,
  ) {
    super(message);
    this.name = "AiClientError";
  }
}

export type GenerateOptions = {
  /** 기본 0.7 */
  temperature?: number;
  /** OpenAI max_tokens / Gemini maxOutputTokens */
  maxTokens?: number;
};

/**
 * OpenAI 우선, 없으면 Gemini.
 * 키가 모두 없으면 null.
 */
export function getAiProvider(): "openai" | "gemini" | null {
  if (process.env.OPENAI_API_KEY?.trim()) return "openai";
  if (process.env.GEMINI_API_KEY?.trim()) return "gemini";
  return null;
}

export async function generateJson<T>(
  system: string,
  userPrompt: string,
  options: GenerateOptions = {},
): Promise<T> {
  const provider = getAiProvider();
  if (!provider) {
    throw new AiClientError(
      "AI API 키가 없습니다. .env.local에 OPENAI_API_KEY 또는 GEMINI_API_KEY를 설정하세요.",
      503,
    );
  }

  const raw =
    provider === "openai"
      ? await callOpenAI(system, userPrompt, options)
      : await callGemini(system, userPrompt, options);

  return parseJsonFromModel<T>(raw);
}

async function callOpenAI(
  system: string,
  userPrompt: string,
  options: GenerateOptions,
): Promise<string> {
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const maxTokens = options.maxTokens ?? 3500;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: options.temperature ?? 0.65,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new AiClientError(`OpenAI 오류: ${res.status} ${text.slice(0, 240)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new AiClientError("OpenAI 응답이 비어 있습니다.");
  return content;
}

async function callGemini(
  system: string,
  userPrompt: string,
  options: GenerateOptions,
): Promise<string> {
  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const key = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: options.temperature ?? 0.65,
        maxOutputTokens: options.maxTokens ?? 3500,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new AiClientError(`Gemini 오류: ${res.status} ${text.slice(0, 240)}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new AiClientError("Gemini 응답이 비어 있습니다.");
  return content;
}

function parseJsonFromModel<T>(raw: string): T {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new AiClientError("모델 응답을 JSON으로 파싱하지 못했습니다.");
    return JSON.parse(match[0]) as T;
  }
}
