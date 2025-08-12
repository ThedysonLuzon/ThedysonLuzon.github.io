// src/lib/aiClient.ts
const AI_ENDPOINT = (import.meta.env.PUBLIC_RESUME_AI_ENDPOINT || "").trim();

export type Snippet = { section: string; text: string };
export type QAResult = { answer: string; snippets: Snippet[] };

export async function answerQuestionLLM(q: string): Promise<QAResult> {
  if (!AI_ENDPOINT) {
    throw new Error("NO_ENDPOINT: Set PUBLIC_RESUME_AI_ENDPOINT in .env and rebuild");
  }
  const r = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: q }),
  });

  const text = await r.text();
  if (!r.ok) {

    try {
      const j = JSON.parse(text);
      throw new Error(`API_${r.status}: ${j.error || text}`);
    } catch {
      throw new Error(`API_${r.status}: ${text}`);
    }
  }

  const json = JSON.parse(text);
  return {
    answer: json.answer,
    snippets: json.citations || [],
  };
}
