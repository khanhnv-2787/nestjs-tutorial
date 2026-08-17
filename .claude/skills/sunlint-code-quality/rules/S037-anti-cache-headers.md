---
title: Set Anti-cache Headers
impact: MEDIUM
impactDescription: prevents sensitive data caching
tags: headers, cache, sensitive-data, security
---

## Set Anti-cache Headers

Sensitive pages cached in browsers or proxies can be accessed by other users.

**Incorrect (no cache control):**

```typescript
app.get('/account', (req, res) => {
  res.json(sensitiveData);  // May be cached!
});
```

**Correct (anti-cache headers):**

```typescript
// For sensitive pages
app.get('/account', (req, res) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  res.json(sensitiveData);
});

// Middleware for all authenticated routes
const noCacheMiddleware = (req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  next();
};

app.use('/api/user', authMiddleware, noCacheMiddleware, userRoutes);
```

**When to use anti-cache:**
- Account pages
- Financial data
- Personal information
- Any authenticated content

**Tools:** helmet.js, Security Headers
