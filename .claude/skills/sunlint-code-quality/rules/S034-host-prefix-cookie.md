---
title: Use __Host- Prefix For Cookies
impact: MEDIUM
impactDescription: ensures cookie is domain-locked
tags: cookies, prefix, domain, security
---

## Use __Host- Prefix For Cookies

The `__Host-` prefix ensures cookies are only sent to the exact host, preventing subdomain attacks.

**Incorrect (no prefix):**

```typescript
res.cookie('session', token, {
  secure: true,
  path: '/'
});
// Cookie could be set by subdomain attacker
```

**Correct (__Host- prefix):**

```typescript
res.cookie('__Host-session', token, {
  secure: true,
  path: '/',
  httpOnly: true,
  sameSite: 'strict'
  // Domain must NOT be set for __Host-
});
```

**__Host- requirements:**
- Must have `Secure` flag
- Must have `Path=/`
- Must NOT have `Domain` attribute
- Cannot be set from subdomain

**Alternative - __Secure- prefix:**

```typescript
// Less restrictive, just requires Secure
res.cookie('__Secure-session', token, {
  secure: true,
  domain: 'example.com'  // Allowed with __Secure-
});
```

**Tools:** Browser DevTools, Security Audit
