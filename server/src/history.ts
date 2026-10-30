import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

// Summarises earlier Grilling Sessions so a new one can build on any that are related.
// Each summary is small (Brief, glossary term names, ADR titles); Claude reads the full
// docs itself when it decides a session is related.

export const BRIEF_FILE = "brief.txt";
const MAX_SESSIONS = 5;

export async function summarisePreviousSessions(sessionsDir: string, excludeId: string): Promise<string> {
  const entries = await readdir(sessionsDir, { withFileTypes: true }).catch(() => []);
  const dirs = await Promise.all(
    entries
      .filter((e) => e.isDirectory() && e.name !== excludeId)
      .map(async (e) => {
        const dir = join(sessionsDir, e.name);
        return { dir, mtime: (await stat(dir)).mtimeMs };
      }),
  );
  const recent = dirs.sort((a, b) => b.mtime - a.mtime).slice(0, MAX_SESSIONS);

  const summaries = (await Promise.all(recent.map(({ dir }) => summarise(dir)))).filter(Boolean);
  if (summaries.length === 0) return "";

  return `## Previous Grilling Sessions

These are earlier sessions, most recent first. If the new Brief is related to one of them, read its docs, say which session you are building on, reuse its glossary terms and do not re-ask decisions its ADRs already settle. If none is related, ignore them. Never edit files in a previous session's folder.

${summaries.join("\n\n")}`;
}

async function summarise(dir: string): Promise<string> {
  const brief = (await readFile(join(dir, BRIEF_FILE), "utf8").catch(() => "")).trim();
  const glossary = await readFile(join(dir, "GLOSSARY.md"), "utf8").catch(() => "");
  const terms = [...glossary.matchAll(/^#{2,3}\s+(.+)$/gm)].map((m) => m[1].trim());

  const adrDir = join(dir, "docs", "adr");
  const adrFiles = (await readdir(adrDir).catch(() => [])).filter((f) => f.endsWith(".md")).sort();
  const adrTitles = await Promise.all(
    adrFiles.map(async (f) => {
      const content = await readFile(join(adrDir, f), "utf8");
      return content.match(/^#\s+(.+)$/m)?.[1].trim() ?? f;
    }),
  );

  if (!brief && terms.length === 0 && adrTitles.length === 0) return "";
  return [
    `### ${dir}`,
    `Brief: ${brief || "(not recorded)"}`,
    terms.length ? `Glossary terms: ${terms.join(", ")}` : "",
    adrTitles.length ? `ADRs:\n${adrTitles.map((t) => `- ${t}`).join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
