# 06: Show/hide password toggle

**What to build:** The password field has a toggle that lets the visitor reveal what they typed and hide it again. The password is hidden by default. The toggle is a real button that keyboard users can reach, and its accessible name says what it will do next ("Show password" / "Hide password"). Using it never submits the form.

**Blocked by:** 01 (Successful Login tracer bullet)

**Status:** ready-for-agent

- [ ] The password is masked by default.
- [ ] Activating "Show password" reveals the password, and the toggle's accessible name becomes "Hide password".
- [ ] Activating "Hide password" masks it again.
- [ ] The toggle is a button that doesn't submit the form, and it can be reached and operated with the keyboard.
- [ ] Revealing the password doesn't change its value or affect Field Validation.
- [ ] App-level tests cover each of the above.
