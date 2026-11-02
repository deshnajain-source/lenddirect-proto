# 02: Credential matching rules and the wrong-credentials message

**What to build:** Sign-in should be forgiving where it is harmless and strict where it matters.
- The email still matches the Demo Account when typed with different capitalisation or with spaces before or after it.
- The password must match exactly, including case.
- Any wrong credentials show one generic form error, "Invalid email or password", that never says which field was wrong. Screen readers announce it.

**Blocked by:** 01 (Sign in with the Demo Account and land on the Home Page).

**Status:** ready-for-agent

- [ ] `  Demo@Acme.com ` with the correct password signs in successfully.
- [ ] `demo@acme.com` with `demo@123` (wrong case) fails.
- [ ] An unknown email or a wrong password shows exactly "Invalid email or password", and the person stays on the Login Page.
- [ ] The message is in a live region, so screen readers announce it.
- [ ] The message clears or is replaced on the next submit.
- [ ] Tests cover case-insensitive and trimmed email matching, a password with the wrong case, and an unknown email. All go through the whole-app seam.
