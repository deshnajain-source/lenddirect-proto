# 01: Sign in with the Demo Account and land on the Home Page

**What to build:** The walking skeleton. A tester opens the app at `/login` and sees the Login Page, which has labelled email and password fields and a sign-in button. They enter the Demo Account credentials (`demo@acme.com` / `Demo@123`) and submit. After a short, realistic delay they land on the Home Page at `/`, which greets them with "Welcome, demo@acme.com".

This ticket also sets up:
- the React + TypeScript + Vite project, with plain CSS;
- `react-router` with the `/login` and `/` addresses;
- the swappable `AuthService` interface and its mock implementation, with the Demo Account hardcoded and a delay of about 500 ms;
- an app-level auth provider that shares the current Session with the pages;
- the test harness (Vitest + React Testing Library) with the single seam: render the whole app at a starting address.

At this stage the Session only needs to live in memory.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [x] The project builds and runs with Vite, and its tests run with Vitest.
- [x] `/login` shows the Login Page with labelled email and password fields and a submit button.
- [x] The UI talks to login only through the `AuthService` interface. The mock is the only implementation.
- [x] Submitting `demo@acme.com` / `Demo@123` resolves after about 500 ms and moves the person to `/`.
- [x] The Home Page shows "Welcome, demo@acme.com".
- [x] A test renders the app at `/login`, signs in with the Demo Account, and asserts the Home Page greeting. It uses only roles, labels and text.
