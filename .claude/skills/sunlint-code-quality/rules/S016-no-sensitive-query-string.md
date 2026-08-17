---
title: Do Not Pass Sensitive Data In Query String
impact: HIGH
impactDescription: prevents credential leakage in logs and history
tags: url, query-string, sensitive-data, leakage, security
---

## Do Not Pass Sensitive Data In Query String

Query strings appear in logs, browser history, referrer headers, and can be cached.

**Incorrect (sensitive data in URL):**

```typescript
// Tokens in URL
fetch(`/api/data?token=${accessToken}`);

// Password in URL
fetch(`/api/login?user=admin&pass=${password}`);

// PII in URL
fetch(`/api/search?ssn=${socialSecurityNumber}`);
```

**Correct (sensitive data in body/headers):**

```typescript
// Token in header
fetch('/api/data', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

// Credentials in body
fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ user: 'admin', pass: password })
});

// Reset token via POST
<form method="POST" action="/reset-password">
  <input type="hidden" name="token" value="abc123">
</form>
```

**Where query strings leak:**
- Server access logs
- Browser history
- Referrer headers
- Proxy/CDN logs
- Shared URLs

**Tools:** Semgrep, Manual Review, Proxy log scanner
