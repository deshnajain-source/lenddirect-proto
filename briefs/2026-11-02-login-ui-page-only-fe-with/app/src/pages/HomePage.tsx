import { useAuth } from '../auth/AuthProvider'

export function HomePage() {
  const { session } = useAuth()

  return (
    <main className="home-page">
      <h1>Welcome, {session?.user.email}</h1>
    </main>
  )
}
