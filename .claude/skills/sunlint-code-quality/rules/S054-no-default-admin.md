---
title: Avoid Default Admin/Root Accounts
impact: HIGH
impactDescription: prevents easy initial access by attackers
tags: admin, default-accounts, credentials, security
---

## Avoid Default Admin/Root Accounts

Default admin accounts with known credentials are automatically scanned by attackers.

**Incorrect (default admin):**

```typescript
// Seed script with default admin
await db.insert('users', {
  email: 'admin@example.com',
  password: await hash('admin123'),
  role: 'admin'
});
```

**Correct (secure admin setup):**

```typescript
// Require admin setup on first run
app.get('/setup', async (req, res) => {
  const hasAdmin = await db.query('SELECT 1 FROM users WHERE role = $1', ['admin']);
  
  if (hasAdmin.length > 0) {
    return res.status(403).json({ error: 'Setup already completed' });
  }
  
  res.render('admin-setup');
});

app.post('/setup', async (req, res) => {
  const { email, password } = req.body;
  
  // Validate strong password
  if (!isStrongPassword(password)) {
    return res.status(400).json({ error: 'Password too weak' });
  }
  
  await db.insert('users', {
    email,
    password: await hash(password),
    role: 'admin'
  });
  
  logger.security('Admin account created', { email });
  res.json({ success: true });
});

// Or use environment variable for initial admin
const INITIAL_ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL;
const INITIAL_ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD;

if (!INITIAL_ADMIN_PASSWORD || INITIAL_ADMIN_PASSWORD.length < 16) {
  throw new Error('Strong admin password required');
}
```

**Tools:** Security Audit, Configuration Review
