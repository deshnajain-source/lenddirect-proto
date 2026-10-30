import type { Stage } from '../api'

export const STEPS: { stage: Stage; title: string; blurb: string }[] = [
  { stage: 'grill', title: 'Grill', blurb: 'Interviews you to sharpen the idea; writes the glossary and ADRs' },
  { stage: 'spec', title: 'Spec', blurb: 'Synthesises the agreed decisions into SPEC.md' },
  { stage: 'tickets', title: 'Tickets', blurb: 'Slices the spec into vertical, demoable tickets' },
  { stage: 'implement', title: 'Implement', blurb: 'Builds each ticket test-first, reviews it, and commits' },
]

export const stepIndex = (stage: Stage) => STEPS.findIndex((s) => s.stage === stage)

// Shows where the Brief is in the grill → spec → tickets → implement pipeline.
export function Stepper({ stage, stageDone }: { stage: Stage; stageDone: boolean }) {
  const current = stepIndex(stage)
  return (
    <ol className="stepper">
      {STEPS.map((s, i) => {
        const state = i < current || (i === current && stageDone) ? 'done' : i === current ? 'current' : ''
        return (
          <li key={s.stage} className={state}>
            <span className="dot">{state === 'done' ? '✓' : i + 1}</span>
            <div>
              <strong>{s.title}</strong>
              <small>{s.blurb}</small>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
