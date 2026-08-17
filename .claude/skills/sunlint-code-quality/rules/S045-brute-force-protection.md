---
title: Implement Brute-force Protection
impact: MEDIUM
impactDescription: prevents password guessing attacks
tags: brute-force, rate-limiting, authentication, security
---

## Implement Brute-force Protection

Without rate limiting, attackers can try millions of password combinations.

**Incorrect (no protection):**

```typescript
app.post('/login', async (req, res) => {
  const user = await authenticate(req.body);
  // No limit on attempts!
});
```

**Correct (rate limiting):**

```typescript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,  // 5 attempts per window
  message: 'Too many login attempts, try again later',
  keyGenerator: (req) => req.body.email || req.ip,
});

app.post('/login', loginLimiter, async (req, res) => {
  const user = await authenticate(req.body);
});

// Progressive delays
const failedAttempts = new Map();

async function handleLogin(email: string, password: string) {
  const attempts = failedAttempts.get(email) || 0;
  
  if (attempts >= 5) {
    const lockoutTime = Math.min(Math.pow(2, attempts - 5) * 60, 3600);
    throw new Error(`Account locked for ${lockoutTime} seconds`);
  }
  
  try {
    const user = await authenticate(email, password);
    failedAttempts.delete(email);
    return user;
  } catch {
    failedAttempts.set(email, attempts + 1);
    throw new Error('Invalid credentials');
  }
}
```

**Tools:** express-rate-limit, Redis, WAF
