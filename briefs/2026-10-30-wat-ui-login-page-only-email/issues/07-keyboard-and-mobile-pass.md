# 07: Keyboard and mobile pass

**What to build:** A final pass over the finished page so it works entirely by keyboard and on small phones. Every control appears in a logical tab order with a visible focus indicator. The card fits screens down to 320px wide with no horizontal scrolling, in both the login form and the Welcome Screen, and in every state: Field Errors, Rejected Login message and in-progress.

**Blocked by:** 02 (Rejected Login), 03 (Field Validation), 04 (Login Attempt in-progress state), 05 (Log Out), 06 (Show/hide password toggle)

**Status:** ready-for-agent

- [ ] The tab order is: email, password, show/hide toggle, Submit. On the Welcome Screen, Log Out can be reached by tabbing.
- [ ] Every interactive element has a clearly visible focus style.
- [ ] At 320px wide the card, the Field Errors, the Rejected Login message and the Demo Credentials hint all fit without horizontal scrolling or overlapping.
- [ ] The layout stays centred and readable on wide screens.
- [ ] An App-level test checks the tab order. Responsive layout is checked by hand at 320px, 768px and desktop widths.
