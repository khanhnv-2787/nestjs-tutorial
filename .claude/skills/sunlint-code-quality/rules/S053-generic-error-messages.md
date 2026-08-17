---
title: Return Generic Error Messages
impact: HIGH
impactDescription: prevents information disclosure
tags: error-messages, information-disclosure, security
---

## Return Generic Error Messages

Detailed error messages help attackers understand your system. Return generic messages to users.

**Incorrect (detailed errors):**

```typescript
try {
  const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
} catch (error) {
  // Exposes database structure!
  res.status(500).json({ 
    error: error.message,
    stack: error.stack,
    query: 'SELECT * FROM users WHERE id = $1'
  });
}

// Exposes user enumeration
if (!user) {
  return res.status(404).json({ error: 'User john@example.com not found' });
}
if (!passwordMatch) {
  return res.status(401).json({ error: 'Incorrect password for john@example.com' });
}
```

**Correct (generic errors):**

```typescript
try {
  const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
} catch (error) {
  // Log details internally
  logger.error('Database query failed', { 
    error: error.message, 
    stack: error.stack,
    requestId: req.id
  });
  
  // Return generic message
  res.status(500).json({ 
    error: 'An internal error occurred',
    requestId: req.id  // For support reference
  });
}

// Same message for both cases prevents enumeration
if (!user || !passwordMatch) {
  return res.status(401).json({ error: 'Invalid credentials' });
}
```

**Tools:** Error Handler Middleware, Security Review
