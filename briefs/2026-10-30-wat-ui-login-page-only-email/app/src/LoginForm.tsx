import { useState, type FormEvent } from 'react'
import { authenticate, type SuccessfulLogin } from './authenticator'
import styles from './LoginForm.module.css'

type Props = { onSuccessfulLogin: (login: SuccessfulLogin) => void }

export default function LoginForm({ onSuccessfulLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = await authenticate(email, password)
    if (result.outcome === 'successful') {
      onSuccessfulLogin(result)
    }
  }

  return (
    <main className={styles.page}>
      <form className={styles.card} noValidate onSubmit={handleSubmit}>
        <p className={styles.appName}>Acme</p>
        <h1 className={styles.title}>Sign in</h1>

        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button type="submit" className={styles.submit}>
          Submit
        </button>

        <p className={styles.hint}>Demo: demo@example.com / password123</p>
      </form>
    </main>
  )
}
