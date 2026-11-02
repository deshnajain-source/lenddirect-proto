import { createContext, useContext, useState, type ReactNode } from 'react'
import type { AuthService, Session } from './AuthService'
import { createMockAuthService } from './mockAuthService'

type AuthContextValue = {
  session: Session | null
  login(email: string, password: string): Promise<void>
  logout(): Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authService] = useState<AuthService>(createMockAuthService)
  const [session, setSession] = useState(() => authService.getSession())

  const value: AuthContextValue = {
    session,
    async login(email, password) {
      setSession(await authService.login(email, password))
    },
    async logout() {
      await authService.logout()
      setSession(null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
