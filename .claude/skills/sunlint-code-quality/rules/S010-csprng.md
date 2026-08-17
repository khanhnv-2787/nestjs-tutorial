---
title: Use CSPRNG For Security Purposes
impact: HIGH
impactDescription: prevents predictable tokens and session hijacking
tags: random, csprng, tokens, session, cryptography, security
---

## Use CSPRNG For Security Purposes

Non-cryptographic random generators are predictable. Attackers can guess session tokens, OTPs, and password reset links generated with weak random sources.

**Incorrect (predictable random):**

```typescript
// INSECURE - predictable!
const sessionId = Math.random().toString(36);

// INSECURE - Date-based
const resetToken = Date.now().toString(36) + Math.random().toString(36);

// INSECURE - UUID v1 (time-based, guessable)
const otp = uuidv1().substring(0, 6);
```

**Correct (cryptographically secure):**

```typescript
import { randomBytes } from 'crypto';

// Cryptographically secure session ID
const sessionId = randomBytes(32).toString('hex');  // 256-bit entropy

// Secure OTP generation
function generateOTP(length: number = 6): string {
  const bytes = randomBytes(4);
  const num = bytes.readUInt32BE(0) % Math.pow(10, length);
  return num.toString().padStart(length, '0');
}

// Secure token for password reset
const resetToken = randomBytes(32).toString('base64url');
```

**CSPRNG by language:**

| Language | Secure | Insecure |
|----------|--------|----------|
| Node.js | `crypto.randomBytes()` | `Math.random()` |
| Python | `secrets`, `os.urandom()` | `random` |
| Java | `SecureRandom` | `Random` |
| Go | `crypto/rand` | `math/rand` |

**Tools:** SonarQube (S2245), Semgrep
