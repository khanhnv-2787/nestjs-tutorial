---
title: Invalidate Session On Logout
impact: MEDIUM
impactDescription: ensures logout actually terminates access
tags: session, logout, invalidation, security
---

## Invalidate Session On Logout

If sessions persist after logout, stolen tokens remain valid.

**Incorrect (client-only logout):**

```typescript
// Frontend-only logout (token still valid!)
const logout = () => {
  localStorage.removeItem('token');
  navigate('/login');
};

// Server doesn't invalidate session
app.post('/logout', (req, res) => {
  res.json({ success: true });  // Session still active!
});
```

**Correct (server-side invalidation):**

```typescript
app.post('/logout', async (req, res) => {
  // Destroy server-side session
  await sessionStore.destroy(req.sessionId);
  
  // For JWT - add to blacklist
  await tokenBlacklist.add(req.token, req.tokenExpiry);
  
  // Clear cookie
  res.clearCookie('session', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  });
  
  // Prevent caching
  res.set('Cache-Control', 'no-store');
  res.json({ success: true });
});

// Frontend - clear all storage
const logout = async () => {
  await fetch('/api/logout', { method: 'POST' });
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = '/login';  // Full reload
};
```

**Tools:** Session Libraries, Security Audit
