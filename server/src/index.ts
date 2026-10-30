import express, { type Response } from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { runTurn } from "./grill.js";
import { parseTurn, type Question } from "./rounds.js";
import { BRIEF_FILE, summarisePreviousSessions } from "./history.js";

const SESSIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "sessions");
const PORT = Number(process.env.PORT ?? 3001);

interface GrillingSession {
  dir: string;
  claudeSessionId?: string;
  busy: boolean;
}

const sessions = new Map<string, GrillingSession>();
const app = express();
app.use(cors());
app.use(express.json());

// Each turn streams newline-delimited JSON: status updates, then a final `turn` or `error`.
async function streamTurn(res: Response, id: string, session: GrillingSession, prompt: string) {
  res.setHeader("Content-Type", "application/x-ndjson");
  const send = (obj: unknown) => res.write(JSON.stringify(obj) + "\n");
  session.busy = true;
  try {
    const { sessionId, text } = await runTurn({
      cwd: session.dir,
      prompt,
      resume: session.claudeSessionId,
      readDirs: [SESSIONS_DIR],
      onEvent: send,
    });
    session.claudeSessionId = sessionId;
    send({ type: "turn", sessionId: id, ...parseTurn(text), raw: text });
  } catch (err) {
    send({ type: "error", message: err instanceof Error ? err.message : String(err) });
  } finally {
    session.busy = false;
    res.end();
  }
}

app.post("/api/sessions", async (req, res) => {
  const brief = String(req.body?.brief ?? "").trim();
  if (!brief) return res.status(400).json({ error: "Brief is required" });

  const id = randomUUID();
  const dir = await makeSessionDir(brief);
  const history = await summarisePreviousSessions(SESSIONS_DIR, basename(dir));
  await writeFile(join(dir, BRIEF_FILE), brief);
  const session: GrillingSession = { dir, busy: false };
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

const STOP_WORDS = new Set(["i", "we", "want", "to", "a", "an", "the", "build", "make", "create", "for", "our", "my", "of", "and", "that", "which", "is"]);

async function collectDocs(dir: string): Promise<{ path: string; content: string }[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e) => join(e.parentPath, e.name))
    .sort((a, b) => rank(relative(dir, a)) - rank(relative(dir, b)) || a.localeCompare(b));
  return Promise.all(
    files.map(async (f) => ({ path: relative(dir, f), content: await readFile(f, "utf8") })),
  );
}

// Glossary first, then ADRs in number order.
const rank = (p: string) => (p.endsWith("GLOSSARY.md") ? 0 : p.endsWith("GLOSSARY-MAP.md") ? -1 : 1);

app.listen(PORT, () => console.log(`Grill server on http://localhost:${PORT}`));
