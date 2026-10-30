import { useState } from 'react'
import LoginForm from './LoginForm'
import WelcomeScreen from './WelcomeScreen'
import type { SuccessfulLogin } from './authenticator'

// The Successful Login lives in memory only, so a reload shows the login form.
export default function App() {
  const [login, setLogin] = useState<SuccessfulLogin | null>(null)

  if (login) {
    return <WelcomeScreen email={login.email} />
  }
  return <LoginForm onSuccessfulLogin={setLogin} />
}
