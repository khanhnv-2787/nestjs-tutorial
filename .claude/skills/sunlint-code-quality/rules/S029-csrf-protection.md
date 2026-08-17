---
title: Apply CSRF Protection
impact: HIGH
impactDescription: prevents cross-site request forgery attacks
tags: csrf, tokens, forms, security
---

## Apply CSRF Protection

CSRF attacks force authenticated users to perform unintended actions.

**Incorrect (no CSRF protection):**

```html
<!-- No CSRF token - vulnerable -->
<form action="/transfer" method="POST">
  <input name="amount" value="1000">
  <button>Transfer</button>
</form>
```

**Correct (CSRF protection):**

```typescript
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });

app.get('/transfer', csrfProtection, (req, res) => {
  res.render('transfer', { csrfToken: req.csrfToken() });
});

app.post('/transfer', csrfProtection, (req, res) => {
  // Token validated automatically
  await processTransfer(req.body);
});
```

```html
<form action="/transfer" method="POST">
  <input type="hidden" name="_csrf" value="<%= csrfToken %>">
  <input name="amount">
  <button>Transfer</button>
</form>
```

```typescript
// SameSite cookies as additional protection
res.cookie('session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});

// For SPAs - use Bearer tokens
fetch('/api/transfer', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Tools:** csurf, SameSite cookies, Bearer tokens
