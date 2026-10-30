export interface Question {
  number: number
  title: string
  body: string
  recommendation: string
}

export type Stage = 'grill' | 'spec' | 'tickets' | 'implement'

export interface Turn {
  sessionId: string
  stage: Stage
  intro: string
  questions: Question[]
  outro: string
  raw: string
  // The /code-review report on a ticket that was just implemented.
  review?: string
  done?: boolean
}

export interface Answer {
  question: Question
  answer: string
}

export interface Ticket {
  path: string
  number: string
  title: string
  blockedBy: string
  done: boolean
}

export interface Doc {
  path: string
  content: string
}

type StreamEvent =
  | { type: 'status'; text: string }
  | ({ type: 'turn' } & Turn)
  | { type: 'error'; message: string }

// Posts to a turn endpoint and reads its newline-delimited JSON stream until the turn arrives.
async function streamTurn(url: string, body: unknown, onStatus: (text: string) => void): Promise<Turn> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? 'Request failed')
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ''
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += value
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.trim()) continue
      const event = JSON.parse(line) as StreamEvent
      if (event.type === 'status') onStatus(event.text)
      else if (event.type === 'error') throw new Error(event.message)
      else return event
    }
  }
  throw new Error('The server closed the connection before Claude finished')
}

export const startSession = (brief: string, onStatus: (t: string) => void) =>
  streamTurn('/api/sessions', { brief }, onStatus)

export const sendAnswers = (sessionId: string, answers: Answer[], onStatus: (t: string) => void) =>
  streamTurn(`/api/sessions/${sessionId}/reply`, { answers }, onStatus)

export const sendMessage = (sessionId: string, message: string, onStatus: (t: string) => void) =>
  streamTurn(`/api/sessions/${sessionId}/reply`, { message }, onStatus)

export const confirmSession = (sessionId: string, onStatus: (t: string) => void) =>
  streamTurn(`/api/sessions/${sessionId}/confirm`, {}, onStatus)

export async function fetchDocs(sessionId: string): Promise<Doc[]> {
  const res = await fetch(`/api/sessions/${sessionId}/docs`)
  return res.ok ? res.json() : []
}

export const docsDownloadUrl = (sessionId: string) => `/api/sessions/${sessionId}/docs.md`

export const startStage = (sessionId: string, stage: 'spec' | 'tickets', onStatus: (t: string) => void) =>
  streamTurn(`/api/sessions/${sessionId}/stage`, { stage }, onStatus)

export const implementTicket = (sessionId: string, ticket: string, onStatus: (t: string) => void) =>
  streamTurn(`/api/sessions/${sessionId}/implement`, { ticket }, onStatus)

export async function fetchTickets(sessionId: string): Promise<Ticket[]> {
  const res = await fetch(`/api/sessions/${sessionId}/tickets`)
  return res.ok ? res.json() : []
}
