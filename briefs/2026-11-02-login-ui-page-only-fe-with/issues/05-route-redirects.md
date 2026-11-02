# 05: Redirects between the Login Page and the Home Page

**What to build:** People always end up on the right page.
- Someone without a Session who opens the Home Page (`/`) is redirected to the Login Page (`/login`).
- Someone with a Session who opens the Login Page is redirected to the Home Page.
- Any unknown address goes to `/`, and the rules above then apply.

**Blocked by:** 04 (Session that survives refreshes, and Log out). The redirect tests start the app with a stored Session.

**Status:** ready-for-agent

- [ ] Rendering the app at `/` with no Session shows the Login Page.
- [ ] Rendering the app at `/login` with a stored Session shows the Home Page.
- [ ] Rendering the app at an unknown address (e.g. `/nope`) shows the Login Page without a Session and the Home Page with one.
- [ ] The wrong page never flashes before the redirect, because the Session is restored first.
- [ ] Tests cover all three redirect cases through the whole-app seam.
