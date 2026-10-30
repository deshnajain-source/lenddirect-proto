import { query } from "@anthropic-ai/claude-agent-sdk";
import { STAGE_CONFIG, systemRules, type Stage } from "./stages.js";

// Runs one turn of a step through Claude Code with the user's installed skills.
// The session folder is the working directory, so every doc and the app land there.

export type TurnEvent = { type: "status"; text: string };

export async function runTurn(opts: {
  stage: Stage;
  cwd: string;
  prompt: string;
  resume?: string;
  readDirs?: string[];
  onEvent: (e: TurnEvent) => void;
}): Promise<{ sessionId: string; text: string }> {
  let sessionId = opts.resume ?? "";
  let text = "";
  const config = STAGE_CONFIG[opts.stage];

  const q = query({
    prompt: opts.prompt,
    options: {
      cwd: opts.cwd,
      resume: opts.resume,
      additionalDirectories: opts.readDirs,
      settingSources: ["user"],
      skills: config.skills,
      permissionMode: "acceptEdits",
      allowedTools: config.allowedTools,
      disallowedTools: config.disallowedTools,
      systemPrompt: { type: "preset", preset: "claude_code", append: systemRules(opts.stage) },
    },
  });

  for await (const msg of q) {
    if ("session_id" in msg && msg.session_id) sessionId = msg.session_id;

    if (msg.type === "assistant" && msg.parent_tool_use_id == null) {
      for (const block of msg.message.content) {
        if (block.type === "tool_use") opts.onEvent({ type: "status", text: describeTool(block.name, block.input) });
        else if (block.type === "text" && block.text.trim()) opts.onEvent({ type: "status", text: firstSentence(block.text) });
      }
    } else if (msg.type === "result") {
      if (msg.subtype !== "success" || msg.is_error) {
        throw new Error(msg.subtype === "success" ? msg.result : `Claude stopped: ${msg.subtype}`);
      }
      text = msg.result;
    }
  }

  return { sessionId, text };
}

function describeTool(name: string, input: unknown): string {
  const i = (input ?? {}) as Record<string, string | undefined>;
  const path = i.file_path?.split("/").slice(-2).join("/");
  switch (name) {
    case "Skill": return `Loading skill ${i.skill ?? ""}…`;
    case "Write": return `Writing ${path ?? "a file"}…`;
    case "Edit": return `Editing ${path ?? "a file"}…`;
    case "Read": return `Reading ${path ?? "a file"}…`;
    case "Glob":
    case "Grep": return `Searching ${i.pattern ?? ""}…`;
    case "Bash": return `Running ${i.description ?? truncate(i.command ?? "a command", 60)}…`;
    case "Agent":
    case "Task": return `Delegating: ${i.description ?? "sub-agent"}…`;
    case "TodoWrite": return "Updating the plan…";
    default: return `Using ${name}…`;
  }
}

const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

const firstSentence = (text: string) =>
  truncate(text.replace(/[#*_`>]/g, "").trim().split(/(?<=[.!?:])\s|\n/)[0], 120);
