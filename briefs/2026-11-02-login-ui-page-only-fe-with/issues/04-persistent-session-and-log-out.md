# 04: Session that survives refreshes, and Log out

**What to build:** Once signed in, a tester stays signed in across page refreshes and browser restarts. The Session is stored in `localStorage` behind the `AuthService`, so the UI never touches storage directly. The Home Page has a Log out button. It ends the Session, removes it from storage, and returns the tester to the Login Page. After logging out, a refresh keeps them logged out. On start-up the app restores any stored Session before deciding which page to show.

**Blocked by:** 01 (Sign in with the Demo Account and land on the Home Page).

**Status:** ready-for-agent

- [ ] After signing in, removing the app and rendering it again at `/` (a simulated refresh) still shows "Welcome, demo@acme.com".
- [ ] The Home Page shows a Log out button.
- [ ] Clicking Log out moves the person to the Login Page.
- [ ] After Log out, rendering the app again does not restore the Session.
- [ ] Only the `AuthService` reads and writes `localStorage`.
- [ ] The test setup clears `localStorage` between tests.
- [ ] Tests cover staying signed in after a refresh, logging out, and staying logged out after a refresh. All go through the whole-app seam.
