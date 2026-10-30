# 04: Login Attempt in-progress state

**What to build:** While a Login Attempt is running (the fake delay), the visitor sees clearly that something is happening and can't interfere with it. The Submit button reads "Signing in…" and is disabled, both fields are read-only, and assistive tech is told the form is busy. Once the attempt ends, in either outcome, everything returns to normal.

**Blocked by:** 01 (Successful Login tracer bullet)

**Status:** ready-for-agent

- [ ] During a Login Attempt the Submit button reads "Signing in…" and is disabled.
- [ ] During a Login Attempt both fields are read-only, and typing doesn't change their values.
- [ ] Clicking the button again or pressing Enter during a Login Attempt doesn't start a second one.
- [ ] The busy state is exposed to assistive tech (e.g. `aria-busy` on the form, or an announced status).
- [ ] After a Rejected Login the button reads its normal label and is enabled, and the fields are editable again.
- [ ] App-level tests use fake timers to check the in-progress state before the delay ends.
