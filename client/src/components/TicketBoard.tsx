import type { Ticket } from '../api'

interface Props {
  tickets: Ticket[]
  onImplement: (ticket: Ticket) => void
}

// Lists the tickets in dependency order; the first one not yet built is the next to implement.
export function TicketBoard({ tickets, onImplement }: Props) {
  const next = tickets.find((t) => !t.done)

  return (
    <article className="card">
      <header className="question-meta">
        <span>Step 4 · Implement</span>
        <span>
          {tickets.filter((t) => t.done).length} of {tickets.length} built
        </span>
      </header>
      <p className="muted">
        Each ticket runs <code>/implement</code> in a fresh Claude session: tests first, then code, then a review,
        then a commit in this session's folder.
      </p>
      <ul className="tickets">
        {tickets.map((t) => (
          <li key={t.path} className={t.done ? 'done' : t === next ? 'next' : ''}>
            <span className="ticket-num">{t.done ? '✓' : t.number}</span>
            <div>
              <strong>{t.title}</strong>
              {t.blockedBy && <small>Blocked by: {t.blockedBy}</small>}
            </div>
            {t === next && (
              <button className="primary" onClick={() => onImplement(t)}>
                Implement
              </button>
            )}
          </li>
        ))}
      </ul>
      {!next && tickets.length > 0 && <p><strong>All tickets are built.</strong> The code is in the session folder's <code>app/</code>.</p>}
    </article>
  )
}
