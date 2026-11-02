import { InvalidCredentialsError, type AuthService, type Session } from './AuthService'

const DEMO_ACCOUNT = { email: 'demo@acme.com', password: 'Demo@123' }
const DELAY_MS = 500

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function createMockAuthService(): AuthService {
  let session: Session | null = null

  return {
    async login(email, password) {
      await wait(DELAY_MS)
      if (email !== DEMO_ACCOUNT.email || password !== DEMO_ACCOUNT.password) {
        throw new InvalidCredentialsError()
      }
      session = { user: { email: DEMO_ACCOUNT.email } }
      return session
    },
    async logout() {
      session = null
    },
    getSession() {
      return session
    },
  }
}
