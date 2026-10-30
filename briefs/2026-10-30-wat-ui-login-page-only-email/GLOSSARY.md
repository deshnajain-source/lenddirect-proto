# Glossary

## Login Attempt
A single submission of an email and password by the user. It ends in exactly one outcome: **Successful Login** or **Rejected Login**. A Login Attempt only starts once both fields pass **Field Validation**.

_Avoid_: sign-in, authentication request

## Demo Credentials
The fixed email and password pair (or pairs) that this page accepts as correct. There are no real user accounts. Demo Credentials stand in for them.

_Avoid_: test user, account, user

## Successful Login
The outcome of a Login Attempt whose email and password match a set of Demo Credentials. Email matching ignores letter case and leading or trailing spaces. The password must match exactly. A Successful Login takes the user to the **Welcome Screen**. It lasts only until the user logs out or the page is reloaded.

## Welcome Screen
What the user sees after a Successful Login: a greeting that shows the email they logged in with, and a **Log Out** action.

## Log Out
Ends the Successful Login and returns the user to the login form.

## Rejected Login
The outcome of a Login Attempt whose email and password don't match any Demo Credentials. The user sees one generic message, "Invalid email or password." It never says which of the two fields was wrong. The message stays until the user edits either field or submits again.

_Avoid_: failed login, error

## Field Validation
Checks that each field's value is well-formed before a Login Attempt can start: the email is present and looks like an email address, and the password is present and at least 8 characters long. A field that fails shows a **Field Error**.

## Field Error
A message tied to one field that explains why its value isn't well-formed. It is a different thing from a Rejected Login, which applies to the whole form.
