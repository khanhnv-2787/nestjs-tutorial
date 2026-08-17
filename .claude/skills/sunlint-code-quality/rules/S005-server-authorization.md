---
title: Enforce Authorization At Trusted Service Layer
impact: CRITICAL
impactDescription: prevents client-side authorization bypass
tags: authorization, server-side, middleware, access-control, security
---

## Enforce Authorization At Trusted Service Layer

Client-side authorization can be bypassed. All permission checks must occur server-side where they cannot be manipulated.

**Incorrect (client-side or trusting client data):**

```typescript
// Client-side authorization (can be bypassed)
if (user.role === 'admin') {
  showAdminPanel();  // Just hide/show - not secure!
}

// Trusting client-sent role
app.delete('/users/:id', (req, res) => {
  const userRole = req.body.role;  // From client!
  if (userRole === 'admin') {
    deleteUser(req.params.id);
  }
});

// Hidden form field for authorization
<input type="hidden" name="isAdmin" value="true" />
```

**Correct (server-side authorization):**

```typescript
// Server-side authorization
const authMiddleware = (requiredRole: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await getUserFromToken(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const hasPermission = await checkPermission(user.id, requiredRole);
    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    req.user = user;
    next();
  };
};

app.delete('/users/:id', 
  authMiddleware('admin'),  // Server-side check
  async (req, res) => {
    await deleteUser(req.params.id);
    res.json({ success: true });
  }
);
```

**Never trust:**
- Client-side JavaScript checks
- Hidden form fields
- URL parameters for access control
- Unvalidated tokens from browser storage

**Tools:** Manual Review, Static Analysis, Penetration Testing
