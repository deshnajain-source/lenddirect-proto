// Splits one assistant turn from the grilling skill into a Round of Questions.
// The skill formats each question as:
//   ❓ **Q1** - **<title>**: <body>
//   ➡️ <recommendation>
//   ---

export interface Question {
  number: number;
  title: string;
  body: string;
  recommendation: string;
}

export interface ParsedTurn {
  intro: string;
  questions: Question[];
  outro: string;
}

const QUESTION_HEADER = /❓\s*\*\*Q(\d+)\*\*\s*[-–—]\s*\*\*(.+?)\*\*\s*:?\s*/g;
const RULE = /\n\s*-{3,}\s*(?:\n|$)/;

export function parseTurn(text: string): ParsedTurn {
  const headers = [...text.matchAll(QUESTION_HEADER)];
  if (headers.length === 0) return { intro: text.trim(), questions: [], outro: "" };

  const intro = text.slice(0, headers[0].index).replace(/-{3,}\s*$/, "").trim();
  const questions: Question[] = [];
  let outro = "";

  headers.forEach((h, i) => {
    const start = h.index! + h[0].length;
    const end = i + 1 < headers.length ? headers[i + 1].index! : text.length;
    let segment = text.slice(start, end);
    const isLast = i === headers.length - 1;

    // Text after the last question's closing rule (or its recommendation paragraph) is the outro.
    if (isLast) {
      const ruleAt = segment.search(RULE);
      if (ruleAt !== -1) {
        outro = segment.slice(ruleAt).replace(RULE, "").trim();
        segment = segment.slice(0, ruleAt);
      }
    }

    const arrowAt = segment.indexOf("➡️");
    let body = arrowAt === -1 ? segment : segment.slice(0, arrowAt);
    let recommendation = arrowAt === -1 ? "" : segment.slice(arrowAt + "➡️".length);

    recommendation = recommendation.split(RULE)[0];
    if (isLast && !outro) {
      const [first, ...rest] = recommendation.trim().split(/\n\s*\n/);
      recommendation = first;
      outro = rest.join("\n\n").trim();
    }
    body = body.split(RULE)[0];

    questions.push({
      number: Number(h[1]),
      title: h[2].trim(),
      body: body.trim(),
      recommendation: recommendation.trim(),
    });
  });

  return { intro, questions, outro };
}
