# Spec: Email & Password Login Page (frontend only)

**Status:** ready-for-agent

## Problem Statement

I need a login page UI that lets someone sign in with an email and password, but there is no backend to authenticate against. I want the page to look and behave like a real login: it should validate input, show progress, accept correct credentials, reject wrong ones and let the user log out again. That way the UI can be built, demoed and tested on its own, without waiting for a server.

## Solution

A single-page React app that shows a centred "Sign in" card with email and password fields, a show/hide password toggle and a Submit button. Field Validation runs in the browser. A Login Attempt is checked against one set of Demo Credentials (`demo@example.com` / `password123`), which are shown as a hint on the page, after a short fake delay. A Successful Login replaces the form with a Welcome Screen that greets the user by email and offers Log Out. A Rejected Login shows a generic "Invalid email or password." message. Nothing is stored between page loads.

## User Stories

1. As a visitor, I want to see a clearly titled "Sign in" card when I open the page, so that I immediately know what the page is for.
2. As a visitor, I want to see the app name ("Acme") above the title, so that I know which product I'm signing in to.
3. As a visitor, I want an email field with a visible label, so that I know what to type into it.
4. As a visitor, I want a password field with a visible label, so that I know what to type into it.
5. As a visitor, I want my password hidden by default, so that people nearby can't read it.
6. As a visitor, I want a show/hide toggle on the password field, so that I can check what I typed.
7. As a visitor, I want the toggle to clearly say whether it will show or hide the password, so that I understand what it will do.
8. As a visitor, I want to see the Demo Credentials as a hint under the form, so that I know what to enter to try the page.
9. As a visitor, I want a Field Error if I leave the email field empty, so that I know it is required.
10. As a visitor, I want a Field Error if what I typed in the email field doesn't look like an email address, so that I can fix typos.
11. As a visitor, I want a Field Error if I leave the password field empty, so that I know it is required.
12. As a visitor, I want a Field Error if my password is shorter than 8 characters, so that I know it's not acceptable.
13. As a visitor, I want Field Errors to appear only after I leave a field or try to submit, so that I'm not nagged while I'm still typing.
14. As a visitor, I want an existing Field Error to update as I correct the field, so that I can see when I've fixed it.
15. As a visitor, I want each Field Error shown right below its own field, so that I know which field it refers to.
16. As a visitor, I want submitting with invalid fields not to start a Login Attempt, so that I don't wait for a result that can't succeed.
17. As a keyboard user, I want focus to move to the first field with a Field Error when my submit fails Field Validation, so that I can fix it immediately.
18. As a visitor, I want to submit the form by pressing Enter in either field, so that I don't have to reach for the mouse.
19. As a visitor, I want the Submit button to read "Signing in…" and be disabled while a Login Attempt is in progress, so that I know something is happening and can't submit twice.
20. As a visitor, I want both fields to be read-only while a Login Attempt is in progress, so that what I submitted can't change mid-attempt.
21. As a visitor, I want my login to succeed when I enter the Demo Credentials, so that I can reach the Welcome Screen.
22. As a visitor, I want my email to match no matter what letter case I use, so that `Demo@Example.com` still works.
23. As a visitor, I want spaces before or after my email to be ignored, so that accidental spaces don't cause a Rejected Login.
24. As a visitor, I want the password to be checked exactly, so that it behaves like a real password.
25. As a visitor, I want to see "Invalid email or password." when my credentials are wrong, so that I know the attempt didn't succeed.
26. As a visitor, I want the Rejected Login message not to say which field was wrong, so that the page behaves like a secure login.
27. As a visitor, I want my email kept after a Rejected Login, so that I don't have to retype it.
28. As a visitor, I want the password cleared and focused after a Rejected Login, so that I can retype it straight away.
29. As a visitor, I want the Rejected Login message to disappear as soon as I edit either field, so that an old error doesn't hang around.
30. As a visitor, I want the Rejected Login message to clear when I submit again, so that I only see the result of my latest attempt.
31. As a signed-in user, I want to see a Welcome Screen that greets me by the email I logged in with, so that I know the login worked.
32. As a signed-in user, I want a Log Out button on the Welcome Screen, so that I can end my session.
33. As a signed-in user, I want Log Out to return me to an empty login form with no errors, so that the next person starts fresh.
34. As a signed-in user, I want focus on the email field after logging out, so that I can start typing straight away.
35. As a visitor, I want a page reload to always take me back to the login form, so that no fake session lingers.
36. As a screen-reader user, I want every field to have an associated label, so that I know what each input is.
37. As a screen-reader user, I want Field Errors linked to their fields and announced, so that I hear what is wrong.
38. As a screen-reader user, I want the Rejected Login message announced when it appears, so that I know the attempt failed.
39. As a screen-reader user, I want to hear when a Login Attempt is in progress, so that I'm not confused by the disabled button.
40. As a keyboard user, I want to reach every control, including the password toggle, in a logical tab order with visible focus, so that I can use the page without a mouse.
41. As a mobile user, I want the card to fit screens as narrow as 320px without horizontal scrolling, so that I can sign in on a small phone.
42. As a mobile user, I want the email field to bring up an email-friendly keyboard, so that typing `@` is easy.
43. As a user of a password manager, I want the fields marked with the right autocomplete hints, so that my browser can fill them.
44. As a developer, I want the Demo Credentials check and fake delay kept in one place, so that it can later be swapped for a real backend call.

## Implementation Decisions

- **Stack:** React + TypeScript, bootstrapped with Vite. No router; the app switches between the login form and the Welcome Screen based on state.
- **Styling:** plain CSS Modules, with no UI library and no Tailwind. A centred card on a light neutral background, responsive down to 320px. No dark mode.
- **Modules:**
  - **Authenticator:** a deep module with a single async function that takes an email and password and resolves to either a Successful Login (including the normalised email) or a Rejected Login. It holds the Demo Credentials, normalises the email (trims spaces, ignores letter case), compares the password exactly and waits about 800ms. This is the only place a future backend call would replace. The delay is a parameter so tests can control it.
  - **Field Validation:** pure functions that return the Field Error message for a value, or nothing if the value is valid. Email: required, must look like an email address. Password: required, at least 8 characters.
  - **Login form:** owns the field values, which fields the user has left (to decide when Field Errors show), the in-progress state and the Rejected Login message. It manages focus: the first invalid field on a failed submit, the password field after a Rejected Login.
  - **Welcome Screen:** shows "Welcome, <email>" and a Log Out button.
  - **App:** keeps the current Successful Login (or none) in memory only, and renders the login form or the Welcome Screen.
- **States the login form can be in:** editing, submitting, rejected (shows the message, which clears on any edit or resubmit). A Successful Login moves control to App.
- **Demo Credentials:** exactly one pair, `demo@example.com` / `password123`, shown as a hint under the form.
- **No persistence:** nothing is written to `localStorage`, `sessionStorage` or cookies.
- **Accessibility:** native `<form>` and `<label>` elements. Field Errors are linked to their inputs with `aria-describedby` and marked with `aria-invalid`. The Rejected Login message sits in a live region with `role="alert"`. The busy state is exposed to assistive tech. Inputs use `type="email"` and `autocomplete="email"`, and the password uses `autocomplete="current-password"`. The password toggle is a real button with an accessible name that reflects what it will do.

## Testing Decisions

- **One seam: the rendered App.** Tests render the whole app with React Testing Library and act only as a user would: typing, tabbing, clicking, pressing Enter. They assert only on what a user can see or hear: text, roles, accessible names, focus, and disabled or read-only states. This single high seam covers every behaviour without coupling tests to internal state or component structure.
- **Controlling the delay:** use Vitest fake timers (or the Authenticator's configurable delay) so tests can observe the in-progress state and then resolve it deterministically.
- **Tools:** Vitest + React Testing Library + `@testing-library/user-event`, with `jsdom`.
- **Behaviours covered:** Field Validation (each rule, when errors appear, focus on a failed submit), the in-progress state, Successful Login (including case- and space-insensitive email), Rejected Login (message, email kept, password cleared and focused, message clears on edit), the show/hide password toggle and Log Out (empty form, focus on email).
- **What makes a good test:** it describes the behaviour from the user's point of view and survives refactoring of the internals. Don't test component state, hooks or CSS class names directly.
- **Prior art:** none; this is a new codebase.
- **No end-to-end tests** (e.g. Playwright) in this scope.

## Out of Scope

- Any backend, real authentication, API calls, tokens or real user accounts.
- Keeping the logged-in state across page reloads.
- "Remember me", "Forgot password", "Sign up" and social login.
- Routing or more than one page.
- Dark mode, theming or a real logo or branding.
- Rate limiting, lockout after repeated Rejected Logins, CAPTCHA.
- Internationalisation; all text is in English.
- End-to-end or visual-regression tests.

## Further Notes

- Terms used in this spec (Login Attempt, Demo Credentials, Successful Login, Rejected Login, Field Validation, Field Error, Welcome Screen, Log Out) are defined in `GLOSSARY.md`.
- No ADRs were recorded. Every decision here is easy to reverse, especially the Authenticator, which is the planned point for adding a real backend later.
- Showing the Demo Credentials on the page is deliberate: this is a demo and a test bed for the UI, not a secure login.
