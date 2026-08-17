---
title: OTPs Must Have 20-bit Entropy Minimum
impact: MEDIUM
impactDescription: prevents OTP brute-forcing
tags: otp, entropy, authentication, 2fa, security
---

## OTPs Must Have 20-bit Entropy Minimum

Low-entropy OTPs can be brute-forced. 20 bits = ~1 million possibilities, requiring rate limiting.

**Incorrect (low entropy OTPs):**

```typescript
// Only 4 digits = ~13 bits entropy
const otp = Math.floor(1000 + Math.random() * 9000).toString();

// Non-random - predictable
const otp = Date.now().toString().slice(-4);
```

**Correct (high entropy OTPs):**

```typescript
import { randomBytes } from 'crypto';

// 6-digit numeric OTP (≈20 bits entropy)
function generateOTP(): string {
  const bytes = randomBytes(4);
  const num = bytes.readUInt32BE(0) % 1000000;
  return num.toString().padStart(6, '0');
}

// 8-digit for higher security (≈26 bits)
function generateStrongOTP(): string {
  const bytes = randomBytes(4);
  const num = bytes.readUInt32BE(0) % 100000000;
  return num.toString().padStart(8, '0');
}
```

**OTP requirements:**
- CSPRNG generation
- ≥20 bits entropy (6+ digits)
- Short expiry (5-10 minutes)
- Single use
- Rate limiting on verification

**Tools:** Manual Review, Unit Test
