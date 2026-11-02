import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { App } from '../App'

/** The single test seam: the whole app, rendered at a starting address. */
export function renderApp(address: string) {
  const user = userEvent.setup()
  const result = render(
    <MemoryRouter initialEntries={[address]}>
      <App />
    </MemoryRouter>,
  )
  return { user, ...result }
}
