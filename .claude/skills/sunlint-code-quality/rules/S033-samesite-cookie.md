---
title: Set SameSite On Session Cookies
impact: MEDIUM
impactDescription: provides CSRF protection
tags: cookies, samesite, csrf, session, security
---

## Set SameSite On Session Cookies

SameSite attribute prevents cookies from being sent in cross-site requests, providing CSRF protection.

**Incorrect (no SameSite):**

```typescript
res.cookie('session', token);  // Default may be 'Lax' in modern browsers
```

**Correct (SameSite set):**

```typescript
// Strict - most secure, may break legitimate cross-site flows
res.cookie('session', token, {
  sameSite: 'strict',
  httpOnly: true,
  secure: true
});

// Lax - allows top-level navigation (clicking links)
res.cookie('session', token, {
  sameSite: 'lax',
  httpOnly: true,
  secure: true
});
```

**SameSite options:**

| Value | Behavior |
|-------|----------|
| `strict` | Never sent cross-site |
| `lax` | Sent for top-level navigation |
| `none` | Always sent (requires Secure) |

**Recommended:** `strict` for session cookies

**Tools:** Browser DevTools, Security Scan
