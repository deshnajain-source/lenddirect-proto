# 02: Rejected Login

**What to build:** When a visitor submits well-formed credentials that don't match the Demo Credentials, the Login Attempt ends in a Rejected Login. The form shows "Invalid email or password." without saying which field was wrong, and screen readers announce the message. The email stays as typed, the password is cleared and focused, and the message disappears as soon as either field is edited or the form is submitted again.

**Blocked by:** 01 (Successful Login tracer bullet)

**Status:** ready-for-agent

- [ ] Submitting the wrong password for `demo@example.com` shows "Invalid email or password.".
- [ ] Submitting an unknown email with any password shows the same message.
- [ ] The message is in a live region (`role="alert"`) so it is announced.
- [ ] After a Rejected Login the email value is unchanged, the password field is empty and has keyboard focus.
- [ ] Typing in either field removes the message.
- [ ] Submitting again removes the old message before the new Login Attempt finishes.
- [ ] A Rejected Login followed by a correct submit leads to the Welcome Screen.
- [ ] App-level tests cover each of the above.
