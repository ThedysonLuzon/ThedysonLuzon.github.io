// src/lib/aiClient.ts
const AI_ENDPOINT = import.meta.env.PUBLIC_RESUME_AI_ENDPOINT;

export type Snippet = { section: string; text: string };
export type QAResult = { answer: string; snippets: Snippet[] };

export async function answerQuestionLLM(q: string): Promise<QAResult> {
  if (!AI_ENDPOINT) throw new Error("AI endpoint missing: set PUBLIC_RESUME_AI_ENDPOINT");
  const r = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: q }),
  });
  const json = await r.json();
  if (!r.ok) throw new Error(json.error || "AI error");
  return { answer: json.answer, snippets: json.citations || [] };
}
