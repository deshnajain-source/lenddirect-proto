// The only place that knows the Demo Credentials. A real backend call would
// replace the body of `authenticate`.

const DEMO_EMAIL = 'demo@example.com'
const DEMO_PASSWORD = 'password123'

export const DEFAULT_DELAY_MS = 800

export type SuccessfulLogin = { outcome: 'successful'; email: string }
export type RejectedLogin = { outcome: 'rejected' }
export type LoginResult = SuccessfulLogin | RejectedLogin

export type AuthenticateOptions = { delayMs?: number }

export async function authenticate(
  email: string,
  password: string,
  { delayMs = DEFAULT_DELAY_MS }: AuthenticateOptions = {},
): Promise<LoginResult> {
  await new Promise((resolve) => setTimeout(resolve, delayMs))

  const normalisedEmail = email.trim().toLowerCase()
  if (normalisedEmail === DEMO_EMAIL && password === DEMO_PASSWORD) {
    return { outcome: 'successful', email: normalisedEmail }
  }
  return { outcome: 'rejected' }
}
