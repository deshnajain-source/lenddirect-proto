# 01: Successful Login tracer bullet

**What to build:** A visitor opens the page and sees a centred "Sign in" card on a light neutral background. The card has the app name "Acme", labelled email and password fields, a Submit button and the Demo Credentials hint. Entering the Demo Credentials and submitting (by clicking the button or pressing Enter) starts a Login Attempt. After the fake delay, it ends in a Successful Login and the form is replaced by the Welcome Screen, which reads "Welcome, <email>". This slice sets up the project (React + TypeScript + Vite, CSS Modules, Vitest + React Testing Library + user-event + jsdom) and the single test seam: the rendered App, driven the way a user would.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] The project starts in dev mode and builds without errors; the test command runs.
- [x] The page shows "Acme", a "Sign in" title, an email field and a password field (each with a visible, associated label), a Submit button and the hint "Demo: demo@example.com / password123".
- [x] The email input uses the email input type with `autocomplete="email"`. The password input is masked with `autocomplete="current-password"`.
- [x] The Authenticator is the only place that knows the Demo Credentials. It trims spaces from the email, ignores its letter case and compares the password exactly. It resolves after a configurable delay (default about 800ms) to either a Successful Login (carrying the normalised email) or a Rejected Login.
- [x] Submitting `demo@example.com` / `password123` shows the Welcome Screen with "Welcome, demo@example.com".
- [x] Submitting `  Demo@Example.COM ` / `password123` also leads to a Successful Login.
- [x] Pressing Enter in either field submits the form.
- [x] The logged-in state lives only in memory: nothing is written to localStorage, sessionStorage or cookies, so a reload shows the login form.
- [x] App-level tests (fake timers or a short injected delay) cover a Successful Login, including the case- and space-insensitive email.
