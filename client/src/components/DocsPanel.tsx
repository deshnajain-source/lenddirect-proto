import { useState } from 'react'
import Markdown from 'react-markdown'
import { docsDownloadUrl, type Doc } from '../api'

export function DocsPanel({ sessionId, docs }: { sessionId: string; docs: Doc[] }) {
  const [open, setOpen] = useState<string | null>(null)
  const current = open ?? docs[0]?.path

  return (
    <aside className="docs">
      <header>
        <h3>Docs</h3>
        {docs.length > 0 && (
          <a className="download" href={docsDownloadUrl(sessionId)} download>
            Download
          </a>
        )}
      </header>
      {docs.length === 0 ? (
        <p className="muted">The glossary and ADRs appear here as terms and decisions are settled.</p>
      ) : (
        <>
          <nav className="doc-tabs">
            {docs.map((d) => (
              <button key={d.path} className={d.path === current ? 'active' : ''} onClick={() => setOpen(d.path)}>
                {d.path}
              </button>
            ))}
          </nav>
          <div className="markdown doc-body">
            <Markdown>{docs.find((d) => d.path === current)?.content ?? ''}</Markdown>
          </div>
        </>
      )}
    </aside>
  )
}
