---
title: Use Only Approved Crypto Algorithms
impact: MEDIUM
impactDescription: ensures cryptographic strength
tags: cryptography, algorithms, hashing, encryption, security
---

## Use Only Approved Crypto Algorithms

Weak algorithms are broken. MD5, SHA1, DES, and ECB mode have known vulnerabilities.

**Incorrect (weak algorithms):**

```typescript
// WEAK hash
const hash = crypto.createHash('md5').update(password).digest('hex');

// WEAK cipher mode (ECB shows patterns)
const cipher = crypto.createCipheriv('aes-256-ecb', key, '');

// WEAK algorithm
const cipher = crypto.createCipheriv('des', key, iv);
```

**Correct (approved algorithms):**

```typescript
import crypto from 'crypto';
import bcrypt from 'bcrypt';

// STRONG hash (for data integrity)
const hash = crypto.createHash('sha256').update(data).digest('hex');

// STRONG authenticated encryption (GCM mode)
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
cipher.setAAD(associatedData);
const encrypted = cipher.update(plaintext);
const authTag = cipher.getAuthTag();

// For passwords - use specialized functions
const hashedPassword = await bcrypt.hash(password, 12);
const isValid = await bcrypt.compare(password, hashedPassword);
```

**Approved vs Prohibited:**

| Purpose | Approved | Prohibited |
|---------|----------|------------|
| Hash | SHA-256, SHA-3, BLAKE2 | MD5, SHA-1 |
| Encryption | AES-GCM, ChaCha20-Poly1305 | DES, 3DES, AES-ECB |
| Password | bcrypt, Argon2, scrypt | MD5, SHA-*, plain AES |

**Tools:** SonarQube (S2070, S4790), Semgrep
