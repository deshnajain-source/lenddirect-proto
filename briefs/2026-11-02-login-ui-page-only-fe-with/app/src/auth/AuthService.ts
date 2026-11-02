export type User = { email: string }

export type Session = { user: User }

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password')
    this.name = 'InvalidCredentialsError'
  }
}

/** The only way the UI talks to login. Swap the implementation for a real backend later. */
export interface AuthService {
  login(email: string, password: string): Promise<Session>
  logout(): Promise<void>
  getSession(): Session | null
}
