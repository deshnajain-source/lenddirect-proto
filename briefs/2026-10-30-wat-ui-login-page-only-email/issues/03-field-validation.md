# 03: Field Validation

**What to build:** Before a Login Attempt can start, each field must pass Field Validation. The email must be filled in and look like an email address. The password must be filled in and at least 8 characters long. Field Errors appear right below their field once the user leaves the field or tries to submit, never while they're first typing. An error that's already showing updates as the user fixes the value. A submit with invalid fields starts no Login Attempt and moves focus to the first field with an error. Field Errors are linked to their inputs so screen readers announce them.

**Blocked by:** 01 (Successful Login tracer bullet)

**Status:** ready-for-agent

- [ ] Leaving the email field empty and moving away shows an "email is required" Field Error.
- [ ] Leaving a badly formed email (e.g. `demo@`) shows an "enter a valid email" Field Error.
- [ ] Leaving the password field empty shows a "password is required" Field Error.
- [ ] Leaving a password shorter than 8 characters shows a "must be at least 8 characters" Field Error.
- [ ] No Field Error appears while the user is typing in a field they haven't left yet.
- [ ] Once shown, a Field Error disappears as soon as the value becomes valid.
- [ ] Submitting an untouched, empty form shows both Field Errors, starts no Login Attempt and focuses the email field.
- [ ] Submitting with a valid email but an invalid password focuses the password field.
- [ ] Invalid inputs have `aria-invalid` set and are linked to their Field Error via `aria-describedby`.
- [ ] The validation rules are pure functions. App-level tests cover the rules, when errors appear and where focus goes.
