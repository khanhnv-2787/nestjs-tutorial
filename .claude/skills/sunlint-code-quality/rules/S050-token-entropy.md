---
title: Reference Tokens 128-bit Entropy CSPRNG
impact: HIGH
impactDescription: prevents token brute-forcing
tags: tokens, entropy, csprng, session, security
---

## Reference Tokens 128-bit Entropy CSPRNG

Low-entropy tokens can be brute-forced. 128 bits of entropy makes attacks computationally infeasible.

**Incorrect (low entropy tokens):**

```typescript
// Low entropy - only 53 bits
const token = Math.random().toString(36);

// Sequential - predictable
const token = `session_${++counter}`;

// Short token - insufficient entropy
const token = randomBytes(4).toString('hex');  // Only 32 bits
```

**Correct (high entropy tokens):**

```typescript
import { randomBytes } from 'crypto';

// 128-bit minimum (16 bytes = 128 bits)
const sessionToken = randomBytes(16).toString('hex');

// 256-bit for extra security (32 bytes)
const refreshToken = randomBytes(32).toString('base64url');

// API keys - 256+ bits
const apiKey = `sk_${randomBytes(32).toString('base64url')}`;
```

**Entropy levels:**

| Bytes | Bits | Security Level |
|-------|------|----------------|
| 8 | 64 | Weak |
| 16 | 128 | Minimum |
| 32 | 256 | Recommended |

**Tools:** Static Analysis, Security Audit
