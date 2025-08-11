// src/components/ResumeChat.tsx
import React, { useEffect, useRef, useState } from "react";
import { answerQuestion, loadResumeIndex, QAResult } from "../lib/resumeIndex";
import { answerQuestionLLM } from "../lib/aiClient";

type Msg = { role: "user" | "bot"; text: string; cites?: QAResult["snippets"] };

export default function ResumeChat() {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);  // local (markdown) index ready
  const [busy, setBusy] = useState(false);
  const [useAI, setUseAI] = useState(true);   // 🚀 AI mode by default
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "bot",
      text:
        "Hi! I’m your Resume Chat. Ask about my skills, projects (e.g., SafeRoomAI), MLOps stack, education, or experience.",
    },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // still load local index for offline / fallback answers
    loadResumeIndex().then(() => setReady(true)).catch(() => setReady(false));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  async function onAsk(q: string) {
    if (!q.trim()) return;
    setMsgs((s) => [...s, { role: "user", text: q }]);
    setBusy(true);
    try {
      const out = useAI ? await answerQuestionLLM(q) : await answerQuestion(q);
      setMsgs((s) => [...s, { role: "bot", text: out.answer, cites: out.snippets }]);
    } catch (e) {
      // graceful fallback to local if AI fails
      try {
        const out = await answerQuestion(q);
        setMsgs((s) => [
          ...s,
          { role: "bot", text: "AI mode failed. Using local resume search.", cites: out.snippets },
        ]);
      } catch {
        setMsgs((s) => [
          ...s,
          { role: "bot", text: "Sorry—something went wrong. Please refresh and try again." },
        ]);
      }
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = inputRef.current?.value ?? "";
    inputRef.current!.value = "";
    onAsk(v);
  }

  return (
    <>
      {/* Floating button */}
      <button
        aria-label="Open Resume Chat"
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          right: "1rem",
          bottom: "1rem",
          width: "56px",
          height: "56px",
          borderRadius: "9999px",
          border: "none",
          boxShadow: "0 8px 24px rgba(0,0,0,.18)",
          background:
            "radial-gradient(120% 120% at 80% 10%, #7c3aed, #4f46e5 60%, #0ea5e9)",
          color: "white",
          cursor: "pointer",
          zIndex: 9999,
        }}
      >
        {open ? "×" : "💬"}
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Resume Chat"
          style={{
            position: "fixed",
            right: "1rem",
            bottom: "5rem",
            width: "min(420px, 92vw)",
            height: "min(70vh, 640px)",
            background: "white",
            color: "#0f172a",
            borderRadius: "16px",
            boxShadow: "0 16px 48px rgba(0,0,0,.22)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9999,
          }}
        >
          <header
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #e5e7eb",
              background:
                "linear-gradient(180deg, rgba(79,70,229,.08), rgba(14,165,233,.04))",
            }}
          >
            <strong>Resume Chat</strong>
            <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.8 }}>
              {useAI ? "AI mode" : ready ? "Local mode" : "Loading resume…"}
            </span>
            <button
              onClick={() => setUseAI((v) => !v)}
              style={{
                float: "right",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "6px 8px",
                background: useAI ? "#eef2ff" : "#f1f5f9",
                cursor: "pointer",
                marginLeft: 8,
              }}
              title="Toggle AI (LLM) mode"
            >
              {useAI ? "✨ AI On" : "AI Off"}
            </button>
          </header>

          <main
            style={{
              padding: "12px 16px",
              overflowY: "auto",
              flex: 1,
            }}
          >
            {msgs.map((m, i) => (
              <div
                key={i}
                style={{
                  margin: "8px 0",
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "9999px",
                    background: m.role === "bot" ? "#4f46e5" : "#0ea5e9",
                    color: "white",
                    fontSize: 16,
                    display: "grid",
                    placeItems: "center",
                    marginTop: 2,
                    flexShrink: 0,
                  }}
                >
                  {m.role === "bot" ? "🤖" : "🧑‍💻"}
                </div>
                <div style={{ lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                  {m.text}
                  {m.cites && m.cites.length > 0 && (
                    <div
                      style={{
                        marginTop: 6,
                        display: "grid",
                        gap: 6,
                      }}
                    >
                      {m.cites.map((c, j) => (
                        <div
                          key={j}
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #e5e7eb",
                            borderRadius: 8,
                            fontSize: 12,
                            background: "#f9fafb",
                          }}
                          title={c.section}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              opacity: 0.8,
                              marginBottom: 4,
                            }}
                          >
                            {c.section}
                          </div>
                          {c.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div style={{ opacity: 0.7, fontSize: 13, marginTop: 8 }}>
                Thinking…
              </div>
            )}
            <div ref={endRef} />
          </main>

          <form
            onSubmit={onSubmit}
            style={{
              borderTop: "1px solid #e5e7eb",
              padding: 12,
              display: "flex",
              gap: 8,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about my skills, projects, tools…"
              disabled={busy || (!useAI && !ready)}  // AI mode doesn’t need local index
              style={{
                flex: 1,
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: "10px 12px",
                outline: "none",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  (e.currentTarget.form as HTMLFormElement)?.requestSubmit();
                }
              }}
            />
            <button
              type="submit"
              disabled={busy || (!useAI && !ready)}
              style={{
                border: "none",
                borderRadius: 10,
                padding: "10px 14px",
                background:
                  (!useAI && !ready) || busy
                    ? "#94a3b8"
                    : "linear-gradient(90deg, #4f46e5, #0ea5e9)",
                color: "white",
                cursor:
                  (!useAI && !ready) || busy ? "not-allowed" : "pointer",
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
