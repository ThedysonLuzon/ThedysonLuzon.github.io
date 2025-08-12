// src/lib/resumeIndex.ts
import MiniSearch from "minisearch";

type Doc = {
  id: number;
  section: string;
  text: string;   
};

let index: MiniSearch<Doc> | null = null;
let docs: Doc[] = [];

function chunkMarkdown(md: string): Doc[] {
  const lines = md.split(/\r?\n/);
  let path: string[] = [];
  let buf: string[] = [];
  const out: Doc[] = [];
  let id = 1;

  const flush = () => {
    const text = buf.join(" ").trim();
    if (text) {
      out.push({
        id: id++,
        section: path.join(" > ") || "Resume",
        text,
      });
    }
    buf = [];
  };

  for (const raw of lines) {
    const line = raw.trim();

    // Headings update the current section path
    const m = line.match(/^(#{1,6})\s+(.*)$/);
    if (m) {
      flush();
      const level = m[1].length;
      const title = m[2].replace(/[#*`_]/g, "").trim();
      path = path.slice(0, level - 1);
      path[level - 1] = title;
      continue;
    }

    // Bullets become their own chunks
    if (/^[-*+]\s+/.test(line)) {
      flush();
      out.push({
        id: id++,
        section: path.join(" > ") || "Resume",
        text: line.replace(/^[-*+]\s+/, "").trim(),
      });
      continue;
    }

    // Paragraph aggregation
    if (line === "") {
      flush();
    } else {
      buf.push(line);
    }
  }
  flush();
  return out;
}

export async function loadResumeIndex() {
  if (index) return { index, docs };

  const res = await fetch("/resume.md", { cache: "no-store" });
  const md = await res.text();

  docs = chunkMarkdown(md);

  index = new MiniSearch<Doc>({
    fields: ["text", "section"],
    storeFields: ["section", "text"],
    searchOptions: {
      prefix: true,
      fuzzy: 0.2,
      combineWith: "AND",
      boost: { section: 1.2, text: 1.0 },
    },
  });
  index.addAll(docs);
  return { index, docs };
}

function dedupe<T>(arr: T[], key: (x: T) => string) {
  const seen = new Set<string>();
  return arr.filter((x) => {
    const k = key(x);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export type QAResult = {
  answer: string;
  snippets: { section: string; text: string }[];
};

export async function answerQuestion(q: string): Promise<QAResult> {
  const { index } = await loadResumeIndex();
  if (!index) return { answer: "Index not ready.", snippets: [] };

  const hits = index.search(q, { limit: 6 });
  if (hits.length === 0) {
    return {
      answer:
        "I couldn’t find that in my resume. Try asking about skills, projects, experience, education, or tools.",
      snippets: [],
    };
  }

  // Gather 4-6 distinct, high-signal chunks
  const top = dedupe(
    hits
      .map((h) => h)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 8)
      .map((h) => ({
        section: (h as any).section as string,
        text: (h as any).text as string,
        score: h.score ?? 0,
      })),
    (x) => x.text.slice(0, 80)
  ).slice(0, 5);

  // Compose a concise, friendly answer
  const intro =
    top[0].section && /summary/i.test(top[0].section)
      ? "Here’s a quick summary:"
      : "Here’s what my resume says:";

  const bullets = top
    .map((t) => `• ${t.text}${t.section ? ` (${t.section})` : ""}`)
    .join("\n");

  const answer =
    `${intro}\n` +
    bullets +
    `\n\nNeed more detail or a link to the project? Ask “show SafeRoomAI details” or “what MLOps tools do you use?”.`;

  return {
    answer,
    snippets: top.map(({ section, text }) => ({ section, text })),
  };
}
