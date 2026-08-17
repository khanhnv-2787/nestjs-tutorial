---
title: Protect OAuth Code Flow Vs CSRF
impact: HIGH
impactDescription: prevents OAuth authorization code theft
tags: oauth, csrf, state, authorization, security
---

## Protect OAuth Code Flow Vs CSRF

Without state parameter validation, attackers can use their own authorization codes to link their accounts.

**Incorrect (no state parameter):**

```typescript
// Initiating OAuth without state
app.get('/auth/google', (req, res) => {
  res.redirect(`https://accounts.google.com/oauth/authorize?
    client_id=${CLIENT_ID}&
    redirect_uri=${REDIRECT_URI}&
    response_type=code`);
  // No state parameter - vulnerable to CSRF!
});
```

**Correct (state parameter validation):**

```typescript
import { randomBytes } from 'crypto';

app.get('/auth/google', (req, res) => {
  // Generate random state
  const state = randomBytes(32).toString('hex');
  
  // Store in session
  req.session.oauthState = state;
  
  res.redirect(`https://accounts.google.com/oauth/authorize?
    client_id=${CLIENT_ID}&
    redirect_uri=${REDIRECT_URI}&
    response_type=code&
    state=${state}`);
});

app.get('/auth/google/callback', (req, res) => {
  const { code, state } = req.query;
  
  // Validate state
  if (state !== req.session.oauthState) {
    return res.status(403).json({ error: 'Invalid state parameter' });
  }
  
  // Clear used state
  delete req.session.oauthState;
  
  // Exchange code for tokens
  const tokens = await exchangeCodeForTokens(code);
});
```

**Tools:** OAuth Libraries, Security Audit
