import { query } from "@anthropic-ai/claude-agent-sdk";

// Runs one turn of a Grilling Session through Claude Code with the user's
// installed grill-with-docs skill. The session folder is the working directory,
// so GLOSSARY.md and docs/adr/ land there.

const UI_RULES = `You are running behind a web UI, not a terminal.
- Ask questions only as plain text in the grilling Round format (❓ **Q<n>** - **<title>**: ... then ➡️ <recommendation>, separated by ---). The UI parses that format.
- Never use the AskUserQuestion tool.
- There is no existing codebase; the working directory only holds the docs you write. Do not dispatch sub-agents.
- When the frontier is empty, do not use the ❓ format: summarise the shared understanding and ask the user to confirm it.`;

export type TurnEvent = { type: "status"; text: string };

export async function runTurn(opts: {
  cwd: string;
  prompt: string;
  resume?: string;
  readDirs?: string[];
  onEvent: (e: TurnEvent) => void;
}): Promise<{ sessionId: string; text: string }> {
  let sessionId = opts.resume ?? "";
  let text = "";

  const q = query({
    prompt: opts.prompt,
    options: {
      cwd: opts.cwd,
      resume: opts.resume,
      additionalDirectories: opts.readDirs,
      settingSources: ["user"],
      skills: ["grill-with-docs", "grilling", "domain-modeling"],
      permissionMode: "acceptEdits",
      disallowedTools: ["AskUserQuestion", "Bash", "Agent", "Task", "WebFetch", "WebSearch"],
      systemPrompt: { type: "preset", preset: "claude_code", append: UI_RULES },
    },
  });

  for await (const msg of q) {
    if ("session_id" in msg && msg.session_id) sessionId = msg.session_id;

    if (msg.type === "assistant") {
      for (const block of msg.message.content) {
        if (block.type === "tool_use") opts.onEvent({ type: "status", text: describeTool(block.name, block.input) });
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
  const path = (input as { file_path?: string })?.file_path?.split("/").slice(-2).join("/");
  switch (name) {
    case "Skill": return "Loading skill…";
    case "Write":
    case "Edit": return `Updating ${path ?? "docs"}…`;
    case "Read": return `Reading ${path ?? "a file"}…`;
    default: return `Using ${name}…`;
  }
}
