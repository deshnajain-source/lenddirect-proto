# 03: Login Page form validation on submit

**What to build:** When a tester submits the Login Page with missing or malformed input, they see clear inline errors next to the fields that need fixing, and no sign-in attempt is made. Validation runs on submit, not while typing.
- Both fields are required.
- The email must look like an email.

Errors are linked to their fields so screen readers read them out.

**Blocked by:** 01 (Sign in with the Demo Account and land on the Home Page).

**Status:** ready-for-agent

- [ ] Submitting an empty email shows a "required" error inline under the email field.
- [ ] Submitting an empty password shows a "required" error inline under the password field.
- [ ] Submitting a badly formed email (e.g. `demo@`) shows an email-format error inline.
- [ ] No errors appear before the first submit.
- [ ] When validation fails, `AuthService.login` is not called and no loading state appears.
- [ ] Each errored field is marked invalid and points to its error text through its accessible description.
- [ ] Tests cover each validation message through the whole-app seam.
