---
title: Authentication Codes Must Expire Quickly
impact: MEDIUM
impactDescription: limits window for code interception attacks
tags: authentication, codes, expiry, otp, security
---

## Authentication Codes Must Expire Quickly

Long-lived codes give attackers more time to intercept and use them. Short expiry limits the attack window.

**Incorrect (codes never expire or last too long):**

```typescript
// Code valid for 24 hours - too long!
const code = generateCode();
await storeCode(userId, code, { expiresIn: '24h' });

// No expiry at all
await storeCode(userId, code);  // Lives forever!
```

**Correct (short expiry with proper handling):**

```typescript
const CODE_EXPIRY_MS = 5 * 60 * 1000;  // 5 minutes

async function generateAuthCode(userId: string): Promise<string> {
  const code = generateSecureOTP();
  
  await redis.setex(
    `auth_code:${userId}`,
    300,  // 5 minutes in seconds
    JSON.stringify({
      code,
      createdAt: Date.now(),
      attempts: 0
    })
  );
  
  return code;
}

async function verifyAuthCode(userId: string, inputCode: string): Promise<boolean> {
  const stored = await redis.get(`auth_code:${userId}`);
  if (!stored) return false;
  
  const { code, attempts } = JSON.parse(stored);
  
  // Rate limit attempts
  if (attempts >= 3) {
    await redis.del(`auth_code:${userId}`);
    throw new Error('Too many attempts');
  }
  
  await redis.incr(`auth_code:${userId}:attempts`);
  
  if (code === inputCode) {
    await redis.del(`auth_code:${userId}`);  // Single use
    return true;
  }
  
  return false;
}
```

**Recommended expiry times:**
- Email verification: 24 hours
- Password reset: 1 hour
- 2FA codes: 5-10 minutes
- Magic links: 15 minutes

**Tools:** Manual Review, Security Audit
