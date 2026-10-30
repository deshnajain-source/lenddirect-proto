// The four steps a Brief goes through, each driven by one of the user's installed skills:
// grill → spec → tickets → implement. Grill, spec and tickets share one Claude session so
// each step builds on the conversation before it; each ticket is implemented in a fresh one.

export type Stage = "grill" | "spec" | "tickets" | "implement";
// A review runs after each ticket is implemented, in its own Claude session. It is not a step the user moves to.
export type TurnKind = Stage | "review";

export const SPEC_FILE = "SPEC.md";
export const ISSUES_DIR = "issues";
export const APP_DIR = "app";

const BASE_RULES = `You are running behind a web UI, not a terminal.
- Ask questions only as plain text in the grilling Round format (❓ **Q<n>** - **<title>**: ... then ➡️ <recommendation>, separated by ---). The UI parses that format.
- Never use the AskUserQuestion tool.
- Never offer something and wait for a reply: the UI cannot answer offers.
- The issue tracker is local markdown files in the working directory (this replaces /setup-matt-pocock-skills):
  - A spec is published as ${SPEC_FILE}.
  - Tickets are published as ${ISSUES_DIR}/<NN>-<slug>.md using the local ticket template.
  - The \`ready-for-agent\` triage label is recorded as the **Status:** line.`;

const STAGE_RULES: Record<TurnKind, string> = {
  grill: `- There is no existing codebase; the working directory only holds the docs you write. Do not dispatch sub-agents.
- When the frontier is empty, do not use the ❓ format: summarise the shared understanding and ask the user to confirm it.
- When a decision meets the ADR criteria, write the ADR straight away.`,
  spec: `- There is no codebase yet; the code will live in ${APP_DIR}/. Seams are therefore proposed, not existing.
- Ask the user to confirm the seams in the ❓ format (one question per seam). Once they are confirmed, write ${SPEC_FILE} without asking anything further.`,
  tickets: `- Work from ${SPEC_FILE}. There is no codebase yet; the code will live in ${APP_DIR}/.
- Quiz the user on the breakdown in the ❓ format: one question for granularity, one for blocking edges, one for merges/splits, with the numbered breakdown in the text before the questions.
- Once the user approves, write the ticket files without asking anything further.`,
  implement: `- Nobody can answer questions during this step. Make reasonable decisions within the ticket and note them in your summary.
- Write all application code and tests under ${APP_DIR}/. The working directory is its own git repository; commit there.
- Skip the code-review step of /implement: a separate review runs on your commit once you finish.
- Finish with a short summary: what was built, test results, and the commit.`,
  review: `- Nobody can answer questions during this step. Do not edit any files: report only.
- The spec for this review is the ticket file passed to you, with ${SPEC_FILE} as its parent spec. Do not look for issue references.
- There is no coding standards file; GLOSSARY.md is the documented standard, on top of the smell baseline.
- Finish with the aggregated report: the ## Standards and ## Spec sections and the one-line summary.`,
};

interface StageConfig {
  skills: string[];
  disallowedTools: string[];
  allowedTools?: string[];
}

const NO_SHELL = ["AskUserQuestion", "Bash", "Agent", "Task", "WebFetch", "WebSearch"];

export const STAGE_CONFIG: Record<TurnKind, StageConfig> = {
  grill: { skills: ["grill-with-docs", "grilling", "domain-modeling"], disallowedTools: NO_SHELL },
  spec: { skills: ["to-spec", "domain-modeling"], disallowedTools: NO_SHELL },
  tickets: { skills: ["to-tickets", "domain-modeling"], disallowedTools: NO_SHELL },
  // Implementing needs a shell for tests, typechecks and commits. Code review is left out: the review turn runs it.
  implement: {
    skills: ["implement", "tdd", "codebase-design"],
    disallowedTools: ["AskUserQuestion", "WebFetch", "WebSearch"],
    allowedTools: ["Bash"],
  },
  // Reviewing needs a shell for git diff and sub-agents for its two axes, but must not change the code.
  review: {
    skills: ["code-review"],
    disallowedTools: ["AskUserQuestion", "WebFetch", "WebSearch", "Write", "Edit", "NotebookEdit"],
    allowedTools: ["Bash"],
  },
};

export const systemRules = (stage: TurnKind) => `${BASE_RULES}\n${STAGE_RULES[stage]}`;

export const START_PROMPT: Record<Exclude<Stage, "grill">, (arg: string) => string> = {
  spec: () => `/to-spec`,
  tickets: () => `/to-tickets ${SPEC_FILE}`,
  implement: (ticket) => `/implement ${ticket}`,
};

// Reviews what one ticket changed since the commit it started from, against the ticket itself.
export const REVIEW_PROMPT = (base: string, ticket: string) => `/code-review ${base} ${ticket}`;

// Sent when the user clicks the step's approve button. Each one finishes the step's
// output so the step ends with its files written, instead of another request for confirmation.
export const CONFIRM_PROMPT: Record<Exclude<Stage, "implement">, string> = {
  grill: `Yes, we have reached a shared understanding. This is the final turn of the session.
Now, without asking anything further:
1. Write an ADR in docs/adr/ for every settled decision that meets the ADR criteria and does not have one yet.
2. Make sure GLOSSARY.md holds every resolved term.
Then reply with a short closing summary listing the files in this session folder. Do not ask for confirmation again and do not offer further work.`,
  spec: `The seams are right. Write ${SPEC_FILE} now using the spec template, without asking anything further, then reply with a short summary of the spec.`,
  tickets: `The breakdown is approved. Write the ticket files to ${ISSUES_DIR}/ now, without asking anything further, then reply with the list of tickets and their blockers.`,
};
