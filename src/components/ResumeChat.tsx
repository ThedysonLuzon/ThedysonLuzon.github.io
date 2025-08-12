// src/components/ResumeChat.tsx
import { useEffect, useRef, useState } from "react";

type Msg = { id: string; role: "user" | "assistant"; text: string };
type SourceLink = { title?: string; url?: string };
type QAResult = { answer: string; sources?: SourceLink[] };

const ENDPOINT: string | undefined = import.meta.env.PUBLIC_RESUME_AI_ENDPOINT;

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ResumeChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { id: uid(), role: "assistant", text: "Hi! Ask about Thedyson’s projects, stack, or experience." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-focus input when panel opens
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 80); }, [open]);

  // Keep scrolled to bottom on new messages
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  // ESC to close, Cmd/Ctrl+K to toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); setOpen(v => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => {
    const open = () => setOpen(true);
    window.addEventListener('resumechat:open', open);
    return () => window.removeEventListener('resumechat:open', open);
  }, []);

  // Command renderers
  function renderSkills(): string {
    return [
      "Here’s a quick snapshot of my core skills:",
      "",
      "• AI / ML: Python, PyTorch, TensorFlow, scikit-learn, OpenCV, YOLOv8, autoencoders, data preprocessing & augmentation",
      "• MLOps: DVC (data/versioning), MLflow (experiments/lineage), BentoML (packaging), FastAPI (serving), Docker, Kubernetes",
      "• Realtime / CV: multi-stream ingest, RTSP watchdog, adaptive micro-batching, quantization",
      "• Backend: TypeScript/Node.js, Express, GraphQL APIs",
      "• Frontend: React + TypeScript, Astro, modern UI patterns",
      "• Data / DB: MongoDB, PostgreSQL, indexed queries/aggregations",
      "• Cloud / DevOps: GitHub Actions (CI/CD), NGINX, Azure & AWS basics",
    ].join("\n");
  }

  function renderStack(): string {
    return [
      "Stack overview:",
      "",
      "• Languages: Python, TypeScript",
      "• ML: PyTorch, TensorFlow, scikit-learn, OpenCV, YOLOv8",
      "• Serving: FastAPI, BentoML",
      "• Experimentation: MLflow (metrics, params, artifacts)",
      "• Data & Versioning: DVC",
      "• Infra: Docker, Kubernetes, NGINX",
      "• Web: React, Astro",
      "• DB: MongoDB, PostgreSQL",
      "• CI/CD: GitHub Actions",
      "• Cloud: Azure + AWS basics",
    ].join("\n");
  }

  function renderContact(): string {
    return [
      "You can reach me here:",
      "",
      "• Email: luzon.thedyson@gmail.com",
      "• LinkedIn: https://www.linkedin.com/in/thedysonluzon/",
      "• GitHub:  https://github.com/ThedysonLuzon",
      "",
      "Need a resume copy? Email me and I’ll send the latest PDF.",
    ].join("\n");
  }

  function isCommand(text: string) {
    return text.trim().startsWith("/");
  }

  async function handleCommand(cmd: string) {
    const c = cmd.trim().toLowerCase();
    if (c === "/skills") {
      setMessages(m => [...m, { id: uid(), role: "assistant", text: renderSkills() }]);
      return true;
    }
    if (c === "/stack") {
      setMessages(m => [...m, { id: uid(), role: "assistant", text: renderStack() }]);
      return true;
    }
    if (c === "/contact") {
      setMessages(m => [...m, { id: uid(), role: "assistant", text: renderContact() }]);
      return true;
    }
    return false;
  }

  // Backend call
  async function askBackend(question: string): Promise<QAResult> {
    if (!ENDPOINT) {
      // Demo mode—no backend configured
      await new Promise(r => setTimeout(r, 600));
      return {
        answer:
          "Demo mode: Set `PUBLIC_RESUME_AI_ENDPOINT` in your `.env` to enable real answers.\n\n" +
          "For now, here’s a summary:\n• SafeRoomAI: Real-time anomaly detection (YOLO + Autoencoder) with reproducible pipelines.\n" +
          "• MLOps: DVC + MLflow lineage, BentoML packaging, K8s deploys.\n" +
          "• Stack: Python, FastAPI, TS/React, Docker/K8s.",
        sources: [
          { title: "SafeRoomAI repo", url: "https://github.com/DC-Capstone1W25/SafeRoomAI" },
          { title: "GitHub", url: "https://github.com/ThedysonLuzon" }
        ]
      };
    }
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, history: messages.slice(-8) })
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Chat error ${res.status}: ${txt || res.statusText}`);
    }
    return (await res.json()) as QAResult;
  }

  // Sending pipeline
  const onSend = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages(m => [...m, { id: uid(), role: "user", text: q }]);
    setLoading(true);

    try {
      if (isCommand(q)) {
        const handled = await handleCommand(q);
        if (handled) return;
      }

      const result = await askBackend(q);
      const src =
        Array.isArray(result.sources) && result.sources.length
          ? `\n\nSources: ${result.sources.slice(0, 3).map(s => s.title || s.url).join(" • ")}`
          : "";
      setMessages(m => [...m, { id: uid(), role: "assistant", text: (result.answer || "No answer.") + src }]);
    } catch (e: any) {
      setMessages(m => [...m, { id: uid(), role: "assistant", text: `Oops—${e?.message || "something went wrong."}` }]);
    } finally {
      setLoading(false);
    }
  };

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // Quick-chip trigger
  const runChip = async (text: string) => {
    if (loading) return;
    setInput("");
    setMessages(m => [...m, { id: uid(), role: "user", text }]);
    setLoading(true);
    try {
      if (await handleCommand(text)) return;
      const result = await askBackend(text);
      const src =
        Array.isArray(result.sources) && result.sources.length
          ? `\n\nSources: ${result.sources.slice(0, 3).map(s => s.title || s.url).join(" • ")}`
          : "";
      setMessages(m => [...m, { id: uid(), role: "assistant", text: (result.answer || "No answer.") + src }]);
    } catch (e: any) {
      setMessages(m => [...m, { id: uid(), role: "assistant", text: `Oops—${e?.message || "something went wrong."}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating action button */}
      <button
        className="chat-fab"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="resume-chat-panel"
        onClick={() => setOpen(true)}
      >
        <span className="fab-core" aria-hidden="true">🤖</span>
        <span className="fab-label">Chat</span>
      </button>

      {/* Scrim */}
      <div
        className={`chat-scrim ${open ? "open" : ""}`}
        role="presentation"
        onClick={() => setOpen(false)}
      />

      {/* Panel */}
      <section
        id="resume-chat-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Resume Chat"
        className={`chat-panel ${open ? "open" : ""}`}
      >
        <header className="chat-header">
          <div className="chat-title">
            <span className="dot" /> Ask my Resume
          </div>
          <div className="chat-actions">
            <button className="hd-btn" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>
        </header>

        <div className="chat-body" ref={listRef}>
          {messages.map(m => (
            <div key={m.id} className={`msg ${m.role}`}>
              <div className="bubble">{m.text}</div>
            </div>
          ))}
          {loading && (
            <div className="msg assistant">
              <div className="bubble typing">
                <span className="tick"></span><span className="tick"></span><span className="tick"></span>
              </div>
            </div>
          )}
        </div>

        {/* Quick chips */}
        <div className="chat-chips" role="list" aria-label="Quick commands">
          <button role="listitem" className="chip" onClick={() => runChip("/skills")}>/skills</button>
          <button role="listitem" className="chip" onClick={() => runChip("/stack")}>/stack</button>
          <button role="listitem" className="chip" onClick={() => runChip("/contact")}>/contact</button>
        </div>

        <footer className="chat-input">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onEnter}
            placeholder="Type a message… try /skills, /stack, /contact"
            aria-label="Message"
          />
          <button className="send" onClick={onSend} disabled={loading}>Send</button>
        </footer>
      </section>
    </>
  );
}
