import express, { type Response } from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { runTurn } from "./grill.js";
import { APP_DIR, CONFIRM_PROMPT, ISSUES_DIR, SPEC_FILE, START_PROMPT, type Stage } from "./stages.js";
import { parseTurn, type Question } from "./rounds.js";
import { BRIEF_FILE, summarisePreviousSessions } from "./history.js";

const SESSIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "sessions");
const PORT = Number(process.env.PORT ?? 3001);

interface GrillingSession {
  dir: string;
  claudeSessionId?: string;
  busy: boolean;
  stage: Stage;
  implemented: Set<string>;
}

const sessions = new Map<string, GrillingSession>();
const app = express();
app.use(cors());
app.use(express.json());

// Each turn streams newline-delimited JSON: status updates, then a final `turn` or `error`.
// Implementing a ticket runs in a fresh Claude session; every other step resumes the shared one.
async function streamTurn(
  res: Response,
  id: string,
  session: GrillingSession,
  prompt: string,
  opts: { confirmed?: boolean; ticket?: string } = {},
) {
  res.setHeader("Content-Type", "application/x-ndjson");
  const send = (obj: unknown) => res.write(JSON.stringify(obj) + "\n");
  const stage = session.stage;
  session.busy = true;
  try {
    const { sessionId, text } = await runTurn({
      stage,
      cwd: session.dir,
      prompt,
      resume: stage === "implement" ? undefined : session.claudeSessionId,
      readDirs: [SESSIONS_DIR],
      onEvent: send,
    });
    if (stage !== "implement") session.claudeSessionId = sessionId;
    if (opts.ticket) session.implemented.add(opts.ticket);
    const done = await isStageDone(session, opts.confirmed ?? false);
    send({ type: "turn", sessionId: id, stage, ...parseTurn(text), raw: text, done });
  } catch (err) {
    send({ type: "error", message: err instanceof Error ? err.message : String(err) });
  } finally {
    session.busy = false;
    res.end();
  }
}

// The grill ends when the user confirms; spec and tickets end once their files exist.
async function isStageDone(session: GrillingSession, confirmed: boolean): Promise<boolean> {
  switch (session.stage) {
    case "grill": return confirmed;
    case "spec": return exists(join(session.dir, SPEC_FILE));
    case "tickets": return (await listTickets(session)).length > 0;
    case "implement": return true;
  }
}

const exists = (path: string) => access(path).then(() => true, () => false);

app.post("/api/sessions", async (req, res) => {
  const brief = String(req.body?.brief ?? "").trim();
  if (!brief) return res.status(400).json({ error: "Brief is required" });

  const id = randomUUID();
  const dir = await makeSessionDir(brief);
  const history = await summarisePreviousSessions(SESSIONS_DIR, basename(dir));
  await writeFile(join(dir, BRIEF_FILE), brief);
  const session: GrillingSession = { dir, busy: false, stage: "grill", implemented: new Set() };
  sessions.set(id, session);
  await streamTurn(res, id, session, `/grill-with-docs ${brief}${history ? `\n\n${history}` : ""}`);
});

app.post("/api/sessions/:id/reply", async (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: "Unknown session" });
  if (session.busy) return res.status(409).json({ error: "still working on the last turn" });

  const answers = req.body?.answers as { question: Question; answer: string }[] | undefined;
  const message = answers?.length
    ? answers.map(({ question, answer }) => `**Q${question.number}** (${question.title}): ${answer}`).join("\n\n")
    : String(req.body?.message ?? "").trim();
  if (!message) return res.status(400).json({ error: "Nothing to send" });

  await streamTurn(res, req.params.id, session, message);
});

// Ends the current step: Claude writes any remaining output for it, then closes the step.
app.post("/api/sessions/:id/confirm", async (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: "Unknown session" });
  if (session.busy) return res.status(409).json({ error: "still working on the last turn" });
  if (session.stage === "implement") return res.status(400).json({ error: "Nothing to confirm while implementing" });
  await streamTurn(res, req.params.id, session, CONFIRM_PROMPT[session.stage], { confirmed: true });
});

// Moves on to the spec or tickets step and runs its skill.
app.post("/api/sessions/:id/stage", async (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: "Unknown session" });
  if (session.busy) return res.status(409).json({ error: "still working on the last turn" });
  const stage = req.body?.stage as Stage;
  if (stage !== "spec" && stage !== "tickets") return res.status(400).json({ error: "Unknown step" });
  session.stage = stage;
  await streamTurn(res, req.params.id, session, START_PROMPT[stage](""));
});

app.get("/api/sessions/:id/tickets", async (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: "Unknown session" });
  res.json(await listTickets(session));
});

// Implements one ticket with /implement, in its own Claude session, committing to the session folder's repo.
app.post("/api/sessions/:id/implement", async (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: "Unknown session" });
  if (session.busy) return res.status(409).json({ error: "still working on the last turn" });
  const ticket = (await listTickets(session)).find((t) => t.path === req.body?.ticket);
  if (!ticket) return res.status(400).json({ error: "Unknown ticket" });
  session.stage = "implement";
  await ensureGitRepo(session.dir);
  await streamTurn(res, req.params.id, session, START_PROMPT.implement(ticket.path), { ticket: ticket.path });
});

app.get("/api/sessions/:id/docs", async (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: "Unknown session" });
  res.json(await collectDocs(session.dir));
});

app.get("/api/sessions/:id/docs.md", async (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).send("Unknown session");
  const docs = await collectDocs(session.dir);
  res.setHeader("Content-Type", "text/markdown");
  res.setHeader("Content-Disposition", `attachment; filename="grilling-docs.md"`);
  res.send(docs.map((d) => `<!-- ${d.path} -->\n\n${d.content}`).join("\n\n---\n\n"));
});

// Names a session folder after the date and the start of its Brief, e.g. 2026-10-27-leave-approval-app-for-hr.
// A number is added when that name is already taken.
async function makeSessionDir(brief: string): Promise<string> {
  await mkdir(SESSIONS_DIR, { recursive: true });
  const words = brief
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((w) => w && !STOP_WORDS.has(w))
    .slice(0, 6);
  const base = [new Date().toISOString().slice(0, 10), ...words].join("-");
  for (let n = 1; ; n++) {
    const dir = join(SESSIONS_DIR, n === 1 ? base : `${base}-${n}`);
    try {
      await mkdir(dir);
      return dir;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "EEXIST") throw err;
    }
  }
}

// The session folder sits inside this project's repo, so it gets its own repo for /implement to commit to.
async function ensureGitRepo(dir: string) {
  if (await exists(join(dir, ".git"))) return;
  const git = promisify(execFile);
  await git("git", ["init", "-q"], { cwd: dir });
  await writeFile(join(dir, ".gitignore"), "node_modules/\ndist/\n");
}

interface Ticket {
  path: string;
  number: string;
  title: string;
  blockedBy: string;
  done: boolean;
}

// Reads the local ticket files written by /to-tickets, in dependency order.
async function listTickets(session: GrillingSession): Promise<Ticket[]> {
  const dir = join(session.dir, ISSUES_DIR);
  const files = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith(".md")).sort();
  return Promise.all(
    files.map(async (f) => {
      const path = `${ISSUES_DIR}/${f}`;
      const content = await readFile(join(dir, f), "utf8");
      const heading = content.match(/^#\s+(\d+)\s*[:.-]\s*(.+)$/m);
      const blockedBy = content.match(/\*\*Blocked by:?\*\*:?\s*(.+)/i)?.[1] ?? "";
      return {
        path,
        number: heading?.[1] ?? f.slice(0, 2),
        title: heading?.[2].trim() ?? f.replace(/^\d+-|\.md$/g, ""),
        blockedBy: blockedBy.trim(),
        done: session.implemented.has(path),
      };
    }),
  );
}

const STOP_WORDS = new Set(["i", "we", "want", "to", "a", "an", "the", "build", "make", "create", "for", "our", "my", "of", "and", "that", "which", "is"]);

// Every markdown doc except the app's own files (which /implement writes under app/).
async function collectDocs(dir: string): Promise<{ path: string; content: string }[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .filter((e) => {
      const top = relative(dir, e.parentPath).split(/[\\/]/)[0];
      return top !== APP_DIR && top !== "node_modules" && !top.startsWith(".");
    })
    .map((e) => join(e.parentPath, e.name))
    .sort((a, b) => rank(relative(dir, a)) - rank(relative(dir, b)) || a.localeCompare(b));
  return Promise.all(
    files.map(async (f) => ({ path: relative(dir, f), content: await readFile(f, "utf8") })),
  );
}

// Glossary first, then ADRs, the spec, and tickets in number order.
const rank = (p: string) =>
  p.endsWith("GLOSSARY-MAP.md") ? -1 : p.endsWith("GLOSSARY.md") ? 0 : p === SPEC_FILE ? 2 : p.startsWith(ISSUES_DIR) ? 3 : 1;

app.listen(PORT, () => console.log(`Grill server on http://localhost:${PORT}`));
