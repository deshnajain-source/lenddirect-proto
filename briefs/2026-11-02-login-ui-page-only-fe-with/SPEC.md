# Spec: Acme Login Page (frontend only, Demo Account)

**Status:** ready-for-agent

## Problem Statement

I want a working login experience for the Acme demo app without building or running a backend. Testers and stakeholders need to open the app, sign in with a known account, see that they are signed in, and log out again. Today nothing exists: there is no Login Page, no way to sign in, and no protected page to land on.

## Solution

A frontend-only app with two pages: a **Login Page** and a **Home Page**. There is exactly one **Demo Account** (`demo@acme.com` / `Demo@123`), and its credentials are shown on the Login Page as a hint. Signing in with it starts a **Session** that survives page refreshes and browser restarts until the person chooses to **Log out**. A mock login service imitates a short network delay. It sits behind an interface so a real backend can replace it later without UI changes. Redirects keep people on the right page: someone without a Session is sent to the Login Page, and someone with a Session is sent to the Home Page.

## User Stories

1. As a tester, I want to open the app and see a Login Page with email and password fields, so that I can sign in.
2. As a tester, I want the Demo Account credentials shown as a hint on the Login Page, so that I don't need to ask anyone what to type.
3. As a tester, I want to sign in with `demo@acme.com` / `Demo@123`, so that I can reach the Home Page.
4. As a tester, I want the email to match even with different capitalisation (e.g. `Demo@Acme.com`), so that a harmless difference in case doesn't block me.
5. As a tester, I want spaces before and after the email to be ignored, so that a stray space from copy-pasting doesn't block me.
6. As a tester, I want the password to be case-sensitive and matched exactly, so that the login behaves like a real one.
7. As a tester, I want to see "Invalid email or password" when my credentials are wrong, so that I know the attempt failed.
8. As a security-minded reviewer, I want the wrong-credentials message to stay generic, so that it never reveals which field was wrong.
9. As a tester, I want to see a "required" error when I submit an empty email, so that I know what's missing.
10. As a tester, I want to see a "required" error when I submit an empty password, so that I know what's missing.
11. As a tester, I want an error when the email doesn't look like an email, so that I can fix typos before trying.
12. As a tester, I want validation to run when I submit rather than on every keystroke, so that I'm not nagged while typing.
13. As a tester, I want each validation error shown inline next to its field, so that I can see which field needs fixing.
14. As a tester, I want the sign-in button to show "Signing in…" and be disabled while the attempt is in progress, so that I know something is happening and can't submit twice.
15. As a tester, I want the sign-in attempt to take a short, realistic moment (about 500 ms), so that the demo feels like a real network call.
16. As a tester, I want to toggle the password between hidden and visible, so that I can check what I typed.
17. As a tester, I want the password hidden by default, so that it isn't shown on screen unless I choose to show it.
18. As a tester, I want to land on the Home Page after signing in, so that I can see it worked.
19. As a signed-in tester, I want the Home Page to greet me with "Welcome, demo@acme.com", so that I can see who is signed in.
20. As a signed-in tester, I want a Log out button on the Home Page, so that I can end my Session.
21. As a tester, I want to be taken to the Login Page after logging out, so that I can sign in again.
22. As a signed-in tester, I want my Session to survive a page refresh, so that I don't have to sign in again.
23. As a signed-in tester, I want my Session to survive closing and reopening the browser, so that the demo stays signed in until I log out.
24. As a tester who has logged out, I want a refresh to keep me logged out, so that logging out really ends the Session.
25. As a visitor without a Session, I want to be redirected to the Login Page when I open the Home Page, so that protected content stays protected.
26. As a signed-in tester, I want to be redirected to the Home Page when I open the Login Page, so that I don't see a pointless sign-in form.
27. As a visitor, I want unknown addresses to send me to the right page, so that I never hit a dead end.
28. As a keyboard user, I want the cursor to start in the email field, so that I can begin typing right away.
29. As a keyboard user, I want Enter to submit the form, so that I don't need a mouse.
30. As a keyboard user, I want the show/hide toggle to be a focusable, labelled button, so that I can use it without a mouse.
31. As a screen-reader user, I want both fields to have real labels, so that I know what each field is for.
32. As a screen-reader user, I want validation and wrong-credentials errors linked to their fields and announced, so that I learn about problems without seeing them.
33. As a mobile tester, I want the login card to fit and stay usable on a small screen, so that I can demo on a phone.
34. As a developer, I want the login logic behind a swappable service interface, so that a real backend can replace the mock without UI changes.
35. As a developer, I want automated tests covering the main flows, so that I can change the app confidently.

## Implementation Decisions

- **Stack:** React + TypeScript, built with Vite. Styling is plain CSS (a centred, responsive card) with no UI library or Tailwind.
- **Routing:** `react-router` with two addresses: `/login` (Login Page) and `/` (Home Page). Any other address goes to `/`, and the redirect rules then decide where the person ends up.
- **Route guards:**
  - The Home Page requires a Session. Without one, redirect to `/login`.
  - The Login Page is for people without a Session. With one, redirect to `/`.
- **AuthService (mock, swappable):** a small interface that the UI depends on. It has three operations:
  - `login(email, password)`: resolves with the signed-in user or rejects with an invalid-credentials error.
  - `logout()`
  - getting the current Session, if there is one.

  The mock implementation:
  - holds the single Demo Account (`demo@acme.com` / `Demo@123`) hardcoded;
  - trims the email and compares it without regard to case;
  - compares the password exactly;
  - waits about 500 ms before resolving or rejecting.
- **Session storage:** the Session lives in `localStorage`, so it survives refreshes and browser restarts. Log out removes it. On start-up the app reads the Session from storage before deciding which page to show. Storage access sits behind the AuthService, so the UI never touches `localStorage` directly.
- **Session state in the UI:** an app-level auth provider shares the current Session plus `login` and `logout` actions with the pages and route guards. It is backed by the AuthService.
- **Login Page form behaviour:**
  - Validation runs on submit. Both fields are required, and the email must have a valid email format.
  - Field errors appear inline, linked to their fields.
  - A failed attempt shows a single generic form error: "Invalid email or password".
  - While submitting, the button is disabled and reads "Signing in…".
  - The page shows a hint with the Demo Account credentials.
  - The password field has a show/hide toggle and is hidden by default.
- **Home Page:** shows "Welcome, <email>" and a Log out button. Logging out returns to the Login Page.
- **Accessibility:**
  - real `<label>` elements on both fields;
  - errors linked to their fields with `aria-describedby` / `aria-invalid`;
  - the form-level error announced through a live region;
  - the cursor starts in the email field;
  - a native form, so Enter submits;
  - the toggle is a `<button type="button">` whose accessible label reflects its state.
- **No ADRs** were recorded. The mock auth is cheap to replace because of the AuthService interface.

## Testing Decisions

- **Tools:** Vitest + React Testing Library, running in jsdom.
- **What makes a good test:** it checks behaviour a user can see, through the rendered UI. It finds elements by role, label or text; types, clicks and presses keys; and checks what appears on screen and which page is shown. It does not test component internals, hook state or storage keys directly.
- **One seam: the whole app, rendered at a starting address.** Every test renders the full app (router, auth provider and pages) at a chosen address and uses it as a user would. This one seam covers the form, validation, the mock login, the redirects and the Session. The mock AuthService is the real implementation under test. Fake timers or `findBy*` queries handle the ~500 ms delay.
  - A refresh is simulated by unmounting and rendering the app again while jsdom's `localStorage` keeps its contents.
  - `localStorage` is cleared between tests.
- **Scenarios covered:**
  - signing in with the Demo Account, including different capitalisation and surrounding spaces in the email;
  - wrong credentials, including a password with the wrong case, showing the generic error;
  - the required-field and email-format validation messages;
  - the loading state during an attempt;
  - the Session surviving a refresh;
  - logging out, including staying logged out after a refresh;
  - the redirect from Home without a Session, the redirect from Login with a Session, and unknown addresses;
  - the show/hide toggle.
- **Prior art:** none. This is a greenfield project with no existing tests.

## Out of Scope

- Any real backend, API, database, or token/JWT handling.
- More than one account, sign-up, or account management.
- Forgot password / password reset, and "Remember me".
- Session expiry, multi-tab synchronisation, or server-side logout.
- Real security of any kind: the Demo Account credentials ship in the frontend bundle on purpose.
- Social or SSO login, MFA, and CAPTCHA.
- Pages beyond the Login Page and Home Page.
- Internationalisation and theming.

## Further Notes

- This is the first piece of the larger "Acme" frontend-only demo app. Later work (e.g. a shop) is expected to build on this app and its Session.
- Domain terms follow `GLOSSARY.md`: Demo Account, Session, Log out, Login Page, Home Page.
- The test seam (the whole app rendered at an address) was chosen without asking the user. If they would rather unit-test the AuthService on its own, it can be added later as a second seam.
