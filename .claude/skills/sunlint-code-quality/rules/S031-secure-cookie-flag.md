---
title: Set Secure Flag On Session Cookies
impact: HIGH
impactDescription: prevents cookie theft over unencrypted connections
tags: cookies, secure, https, session, security
---

## Set Secure Flag On Session Cookies

Without the Secure flag, cookies can be sent over unencrypted HTTP connections.

**Incorrect (no Secure flag):**

```typescript
res.cookie('session', token);  // No flags!
```

**Correct (Secure flag set):**

```typescript
res.cookie('session', token, {
  secure: true,  // HTTPS only
  httpOnly: true,
  sameSite: 'strict'
});
```

**Production enforcement:**

```typescript
const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
  cookie: {
    secure: isProduction,  // Enforce in production
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 3600000
  }
}));

// Fail if HTTPS not configured in production
if (isProduction && !process.env.HTTPS_ENABLED) {
  throw new Error('HTTPS required in production');
}
```

**Tools:** helmet.js, Session libraries
