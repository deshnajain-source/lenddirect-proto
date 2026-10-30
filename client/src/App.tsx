import { useState } from "react";
import Markdown from "react-markdown";
import {
  fetchDocs,
  sendAnswers,
  sendMessage,
  startSession,
  type Doc,
  type Turn,
} from "./api";
import { QuestionCard } from "./components/QuestionCard";
import { DocsPanel } from "./components/DocsPanel";

type Phase = "brief" | "working" | "round" | "message";

export default function App() {
  const [phase, setPhase] = useState<Phase>("brief");
  const [brief, setBrief] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [turn, setTurn] = useState<Turn | null>(null);
  const [round, setRound] = useState(0);
  const [position, setPosition] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [reply, setReply] = useState("");
  const [docs, setDocs] = useState<Doc[]>([]);

  // Runs one Claude turn, then shows its Round one Question at a time, or its message if it asked none.
  async function run(
    request: (onStatus: (t: string) => void) => Promise<Turn>,
    fallback: Phase,
  ) {
    setPhase("working");
    setStatus("thinking…");
    setError("");
    try {
      const next = await request(setStatus);
      setTurn(next);
      setDocs(await fetchDocs(next.sessionId));
      if (next.questions.length > 0) {
        setRound((r) => r + 1);
        setPosition(0);
        setAnswers(next.questions.map(() => ""));
        setPhase("round");
      } else {
        setReply("");
        setPhase("message");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase(fallback);
    }
  }

  const submitRound = () =>
    run(
      (onStatus) =>
        sendAnswers(
          turn!.sessionId,
          turn!.questions.map((question, i) => ({
            question,
            answer: answers[i],
          })),
          onStatus,
        ),
      "round",
    );

  const setAnswer = (value: string) =>
    setAnswers((a) => a.map((x, i) => (i === position ? value : x)));

  const next = () =>
    position === turn!.questions.length - 1
      ? submitRound()
      : setPosition((p) => p + 1);

  return (
    <div className="app">
      <header className="topbar">
        {phase !== "brief" && (
          <button className="ghost" onClick={() => window.location.reload()}>
            New session
          </button>
        )}
      </header>

      {error && <div className="error">{error}</div>}

      {phase === "brief" ? (
        <main className="brief">
          <h2>What would you like to explore?</h2>
          <p className="muted">
            Describe your idea, plan, or problem. Get guidance through
            thoughtful questions, clarify your requirements, explore different
            approaches, and document key concepts and decisions as you go.
          </p>
          <textarea
            rows={8}
            autoFocus
            value={brief}
            placeholder="e.g. I want to build a leave-approval app for our HR team…"
            onChange={(e) => setBrief(e.target.value)}
          />
          <button
            className="primary"
            disabled={!brief.trim()}
            onClick={() => run((s) => startSession(brief, s), "brief")}
          >
            Start 
          </button>
        </main>
      ) : (
        <div className="session">
          <main className="stage">
            {phase === "working" && (
              <div className="card working">
                <div className="spinner" />
                <p>{status}</p>
              </div>
            )}

            {phase === "round" && turn && (
              <>
                {turn.intro && position === 0 && (
                  <div className="markdown intro">
                    <Markdown>{turn.intro}</Markdown>
                  </div>
                )}
                <QuestionCard
                  question={turn.questions[position]}
                  position={position}
                  total={turn.questions.length}
                  round={round}
                  answer={answers[position]}
                  onAnswerChange={setAnswer}
                  onAccept={() => setAnswer("yes")}
                  onBack={() => setPosition((p) => Math.max(0, p - 1))}
                  onNext={next}
                />
              </>
            )}

            {phase === "message" && turn && (
              <article className="card message">
                <div className="markdown">
                  <Markdown>{turn.raw}</Markdown>
                </div>
                <textarea
                  rows={3}
                  value={reply}
                  placeholder="Reply to Claude…"
                  onChange={(e) => setReply(e.target.value)}
                />
                <footer className="nav">
                  <button
                    className="secondary"
                    disabled={!reply.trim()}
                    onClick={() =>
                      run(
                        (s) => sendMessage(turn.sessionId, reply, s),
                        "message",
                      )
                    }
                  >
                    Send reply
                  </button>
                  <button
                    className="primary"
                    onClick={() =>
                      run(
                        (s) =>
                          sendMessage(
                            turn.sessionId,
                            "Yes, we have reached a shared understanding.",
                            s,
                          ),
                        "message",
                      )
                    }
                  >
                    Confirm shared understanding
                  </button>
                </footer>
              </article>
            )}
          </main>
          {turn && <DocsPanel sessionId={turn.sessionId} docs={docs} />}
        </div>
      )}
    </div>
  );
}
