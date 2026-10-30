import { useEffect, useRef } from 'react'
import Markdown from 'react-markdown'
import type { Question } from '../api'

interface Props {
  question: Question
  position: number
  total: number
  round: number
  answer: string
  onAnswerChange: (answer: string) => void
  onAccept: () => void
  onBack: () => void
  onNext: () => void
}

export function QuestionCard({ question, position, total, round, answer, onAnswerChange, onAccept, onBack, onNext }: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isLast = position === total - 1
  const accepted = answer.trim().toLowerCase() === 'yes'

  useEffect(() => inputRef.current?.focus(), [question])

  return (
    <article className="card question">
      <header className="question-meta">
        <span>Round {round}</span>
        <span>
          Question {position + 1} of {total}
        </span>
      </header>
      <div className="progress" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={i < position ? 'done' : i === position ? 'current' : ''} />
        ))}
      </div>

      <h2>
        <span className="qnum">Q{question.number}</span> {question.title}
      </h2>
      <div className="markdown">
        <Markdown>{question.body}</Markdown>
      </div>

      {question.recommendation && (
        <div className="recommendation">
          <div className="label">Recommended</div>
          <div className="markdown">
            <Markdown>{question.recommendation}</Markdown>
          </div>
          <button className={accepted ? 'primary' : 'secondary'} onClick={onAccept}>
            {accepted ? '✓ Accepted' : 'Accept recommendation'}
          </button>
        </div>
      )}

      <label className="answer">
        <span>Or write your own answer</span>
        <textarea
          ref={inputRef}
          rows={3}
          value={answer}
          placeholder="Your answer…"
          onChange={(e) => onAnswerChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && answer.trim()) onNext()
          }}
        />
      </label>

      <footer className="nav">
        <button className="ghost" onClick={onBack} disabled={position === 0}>
          ← Back
        </button>
        <button className="primary" onClick={onNext} disabled={!answer.trim()}>
          {isLast ? 'Submit round' : 'Next →'}
        </button>
      </footer>
    </article>
  )
}
