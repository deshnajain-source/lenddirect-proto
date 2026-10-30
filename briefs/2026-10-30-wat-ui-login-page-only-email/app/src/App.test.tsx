import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('login page', () => {
  it('shows the Acme sign in card with labelled fields, a Submit button and the Demo Credentials hint', () => {
    render(<App />)

    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()

    const email = screen.getByLabelText('Email')
    expect(email).toHaveAttribute('type', 'email')
    expect(email).toHaveAttribute('autocomplete', 'email')

    const password = screen.getByLabelText('Password')
    expect(password).toHaveAttribute('type', 'password')
    expect(password).toHaveAttribute('autocomplete', 'current-password')

    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    expect(
      screen.getByText('Demo: demo@example.com / password123'),
    ).toBeInTheDocument()
  })
})

describe('Successful Login', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function setup() {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)
    return user
  }

  async function finishLoginAttempt() {
    await act(() => vi.advanceTimersByTimeAsync(800))
  }

  it('shows the Welcome Screen after the fake delay when the Demo Credentials are submitted', async () => {
    const user = setup()

    await user.type(screen.getByLabelText('Email'), 'demo@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(screen.queryByText('Welcome, demo@example.com')).not.toBeInTheDocument()

    await finishLoginAttempt()

    expect(screen.getByText('Welcome, demo@example.com')).toBeInTheDocument()
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()
  })

  it('ignores spaces around the email and its letter case, greeting with the normalised email', async () => {
    const user = setup()

    await user.type(screen.getByLabelText('Email'), '  Demo@Example.COM ')
    await user.type(screen.getByLabelText('Password'), 'password123{Enter}')
    await finishLoginAttempt()

    expect(screen.getByText('Welcome, demo@example.com')).toBeInTheDocument()
  })

  it('submits when Enter is pressed in the email field', async () => {
    const user = setup()

    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Email'), 'demo@example.com{Enter}')
    await finishLoginAttempt()

    expect(screen.getByText('Welcome, demo@example.com')).toBeInTheDocument()
  })

  it('checks the password exactly', async () => {
    const user = setup()

    await user.type(screen.getByLabelText('Email'), 'demo@example.com')
    await user.type(screen.getByLabelText('Password'), 'PASSWORD123{Enter}')
    await finishLoginAttempt()

    expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('keeps the login in memory only, so a reload shows the login form', async () => {
    localStorage.clear()
    sessionStorage.clear()
    const user = setup()

    await user.type(screen.getByLabelText('Email'), 'demo@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123{Enter}')
    await finishLoginAttempt()
    expect(screen.getByText('Welcome, demo@example.com')).toBeInTheDocument()

    expect(localStorage).toHaveLength(0)
    expect(sessionStorage).toHaveLength(0)
    expect(document.cookie).toBe('')

    cleanup()
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })
})
