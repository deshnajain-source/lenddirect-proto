# 06: Login Page affordances and responsive styling

**What to build:** The Login Page feels finished and is easy to demo.
- A hint shows the Demo Account credentials ("Demo: demo@acme.com / Demo@123").
- While a sign-in attempt runs, the button is disabled and reads "Signing in…", so it can't be submitted twice.
- A keyboard-accessible show/hide toggle reveals the password. The password is hidden by default.
- The cursor starts in the email field, and Enter submits the form.
- Everything sits in a centred card, styled with plain CSS, that stays usable on small screens.

**Blocked by:** 01 (Sign in with the Demo Account and land on the Home Page).

**Status:** ready-for-agent

- [ ] The Demo Account credentials hint is visible on the Login Page.
- [ ] During the ~500 ms attempt, the submit button is disabled and labelled "Signing in…". Afterwards it returns to normal if the person stays on the Login Page.
- [ ] The password field starts hidden. The toggle is a focusable `button` (not a submit button) whose accessible label says whether it will show or hide the password, and it switches the field between hidden and visible.
- [ ] The email field has focus when the Login Page loads.
- [ ] Pressing Enter in either field submits the form.
- [ ] The login card is centred and fits a 360 px wide screen without scrolling sideways.
- [ ] Tests cover the hint, the loading state, the toggle and the starting focus through the whole-app seam.
