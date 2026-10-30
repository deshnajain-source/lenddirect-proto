import styles from './LoginForm.module.css'

type Props = { email: string }

export default function WelcomeScreen({ email }: Props) {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.appName}>Acme</p>
        <h1 className={styles.title}>Welcome, {email}</h1>
      </section>
    </main>
  )
}
