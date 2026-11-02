# Glossary

**Demo Account**
The single built-in account that can sign in to the app. No other accounts exist, and none can be created.
_Avoid_: test user, dummy user, admin

**Session**
The signed-in state of a person who used the Demo Account. It lasts until they **log out**, even across page refreshes and browser restarts.
_Avoid_: token, cookie

**Log out**
Ending a **Session** on purpose. Afterwards the person is back on the **Login Page**.
_Avoid_: sign out, exit

**Login Page**
The page where a person enters an email and password to start a **Session**.
_Avoid_: sign-in screen, auth page

**Home Page**
The page a person sees once a **Session** has started. It greets them and lets them log out.
_Avoid_: dashboard, landing page
