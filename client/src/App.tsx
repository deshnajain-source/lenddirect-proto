import { useState } from "react";
import Markdown from "react-markdown";
import {
  confirmSession,
  fetchDocs,
  fetchTickets,
  implementTicket,
  sendAnswers,
  sendMessage,
  startSession,
  startStage,
  type Doc,
  type Stage,
  type Ticket,
  type Turn,
} from "./api";
import { QuestionCard } from "./components/QuestionCard";
import { DocsPanel } from "./components/DocsPanel";
import { STEPS, Stepper, stepIndex } from "./components/Stepper";
import { TicketBoard } from "./components/TicketBoard";

type Phase = "brief" | "working" | "round" | "message" | "done" | "board";

const CONFIRM_LABEL: Record<Stage, string> = {
  grill: "Confirm shared understanding",
  spec: "Seams look right — write the spec",
  tickets: "Approve breakdown — publish tickets",
  implement: "",
};

const NEXT_LABEL: Partial<Record<Stage, string>> = {
  grill: "Continue to step 2: write the spec →",
  spec: "Continue to step 3: break into tickets →",
  tickets: "Continue to step 4: implement →",
};

const DONE_TITLE: Record<Stage, string> = {
  grill: "Step 1 done — shared understanding reached",
  spec: "Step 2 done — SPEC.md written",
  tickets: "Step 3 done — tickets published",
  implement: "Ticket implemented",
};

export default function App() {
  const [phase, setPhase] = useState<Phase>("brief");
  const [stage, setStage] = useState<Stage>("grill");
  const [log, setLog] = useState<string[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
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
    workingStage: Stage = stage,
  ) {
    setPhase("working");
    setStage(workingStage);
    setStatus("Starting Claude…");
    setLog([]);
    setError("");
    const onStatus = (text: string) => {
      setStatus(text);
      setLog((l) => [...l, text].slice(-8));
    };
    try {
      const next = await request(onStatus);
      setTurn(next);
      setStage(next.stage);
      setDocs(await fetchDocs(next.sessionId));
      if (next.stage === "implement") {
        setTickets(await fetchTickets(next.sessionId));
        setPhase("board");
      } else if (next.done) {
        setPhase("done");
      } else if (next.questions.length > 0) {
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

  const continueToNextStep = async () => {
    const id = turn!.sessionId;
    if (stage === "grill") run((s) => startStage(id, "spec", s), "done", "spec");
    else if (stage === "spec") run((s) => startStage(id, "tickets", s), "done", "tickets");
    else {
      setTickets(await fetchTickets(id));
      setStage("implement");
      setTurn({ ...turn!, raw: "" });
      setPhase("board");
    }
  };

  const implement = (ticket: Ticket) =>
    run((s) => implementTicket(turn!.sessionId, ticket.path, s), "board", "implement");

  const stageDone =
    phase === "done" || (stage === "implement" && tickets.length > 0 && tickets.every((t) => t.done));

  const next = () =>
    position === turn!.questions.length - 1
      ? submitRound()
      : setPosition((p) => p + 1);

  return (
    <div className="app">
      <header className="topbar">
        <h1>Brief → Build</h1>
        {phase !== "brief" && (
          <button className="ghost" onClick={() => window.location.reload()}>
            New session
          </button>
        )}
      </header>

      {error && <div className="error">{error}</div>}

      {phase === "brief" ? (
        <main className="brief">
          <Stepper stage="grill" stageDone={false} />
          <h2>What would you like to build?</h2>
          <p className="muted">
            Describe your idea. Claude grills you on it until the decisions are
            clear, turns them into a spec, slices the spec into tickets, then
            builds each ticket test-first. You approve every step.
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
        <>
        <Stepper stage={stage} stageDone={stageDone} />
        <div className="session">
          <main className="stage">
            {phase === "working" && (
              <div className="card working">
                <div className="working-head">
                  <div className="spinner" />
                  <div>
                    <div className="label">
                      Step {stepIndex(stage) + 1} · {STEPS[stepIndex(stage)].title}
                    </div>
                    <p>{status}</p>
                  </div>
                </div>
                {log.length > 1 && (
                  <ol className="activity">
                    {log.slice(0, -1).map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ol>
                )}
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
                      run((s) => confirmSession(turn.sessionId, s), "message")
                    }
                  >
                    {CONFIRM_LABEL[stage]}
                  </button>
                </footer>
              </article>
            )}

            {phase === "done" && turn && (
              <article className="card message">
                <div className="label">{DONE_TITLE[stage]}</div>
                <div className="markdown">
                  <Markdown>{turn.raw}</Markdown>
                </div>
                <footer className="nav">
                  <button className="ghost" onClick={() => window.location.reload()}>
                    Stop here
                  </button>
                  <button className="primary" onClick={continueToNextStep}>
                    {NEXT_LABEL[stage]}
                  </button>
                </footer>
              </article>
            )}

            {phase === "board" && turn && (
              <>
                {turn.raw && (
                  <article className="card message">
                    <div className="label">{DONE_TITLE.implement}</div>
                    <div className="markdown">
                      <Markdown>{turn.raw}</Markdown>
                    </div>
                  </article>
                )}
                {turn.review && (
                  <article className="card message">
                    <div className="label">Code review</div>
                    <div className="markdown">
                      <Markdown>{turn.review}</Markdown>
                    </div>
                  </article>
                )}
                <TicketBoard tickets={tickets} onImplement={implement} />
              </>
            )}
          </main>
          {turn && <DocsPanel sessionId={turn.sessionId} docs={docs} />}
        </div>
        </>
      )}
    </div>
  );
}
