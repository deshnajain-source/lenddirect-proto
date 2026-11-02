import { screen } from '@testing-library/react'
import { renderApp } from './test/renderApp'

describe('signing in', () => {
  it('signs in with the Demo Account and lands on the Home Page', async () => {
    const { user } = renderApp('/login')

    await user.type(screen.getByLabelText('Email'), 'demo@acme.com')
    await user.type(screen.getByLabelText('Password'), 'Demo@123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByRole('heading', { name: 'Welcome, demo@acme.com' }, { timeout: 2000 }),
    ).toBeInTheDocument()
  })
})
