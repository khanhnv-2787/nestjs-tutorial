---
title: Re-authenticate For Long-lived Sessions
impact: MEDIUM
impactDescription: ensures continuous user identity verification
tags: session, authentication, timeout, reauthentication, security
---

## Re-authenticate For Long-lived Sessions

Long-running sessions may be hijacked. Periodic re-authentication ensures the original user is still present.

**Incorrect (sessions never expire):**

```typescript
// Session lasts forever
app.use(session({
  cookie: { maxAge: null }  // Never expires
}));
```

**Correct (periodic re-authentication):**

```typescript
const SESSION_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
const REAUTH_INTERVAL = 4 * 60 * 60 * 1000;  // 4 hours

app.use((req, res, next) => {
  if (!req.session.userId) return next();
  
  const lastAuth = req.session.lastAuthenticated || 0;
  const now = Date.now();
  
  // Check if re-authentication needed
  if (now - lastAuth > REAUTH_INTERVAL) {
    req.session.requiresReauth = true;
  }
  
  next();
});

// Middleware for sensitive operations
const requireRecentAuth = (req, res, next) => {
  if (req.session.requiresReauth) {
    return res.status(401).json({ 
      error: 'Re-authentication required',
      code: 'REAUTH_REQUIRED'
    });
  }
  next();
};

app.post('/sensitive-action', requireRecentAuth, handler);
```

**Tools:** Session Management Libraries, Manual Review
