---
title: Centralize Constants
impact: HIGH
impactDescription: makes values easy to find and update
tags: constants, magic-numbers, configuration, quality
---

## Centralize Constants

Magic numbers scattered throughout code are hard to find and change.

**Incorrect (magic numbers):**

```typescript
if (password.length < 8) { }
if (retryCount > 3) { }
if (status === 1) { }
setTimeout(callback, 300000);
if (user.role === 'admin') { }
```

**Correct (centralized constants):**

```typescript
// constants.ts
export const PASSWORD_MIN_LENGTH = 8;
export const MAX_RETRY_ATTEMPTS = 3;
export const SESSION_TIMEOUT_MS = 5 * 60 * 1000;  // 5 minutes

export const OrderStatus = {
  PENDING: 1,
  APPROVED: 2,
  SHIPPED: 3,
} as const;

export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
} as const;

// Usage
if (password.length < PASSWORD_MIN_LENGTH) { }
if (retryCount > MAX_RETRY_ATTEMPTS) { }
if (status === OrderStatus.PENDING) { }
setTimeout(callback, SESSION_TIMEOUT_MS);
if (user.role === UserRole.ADMIN) { }
```

**Benefits:**
- Single source of truth
- Self-documenting
- Easy to update
- Type safety with `as const`

**Tools:** Linter, Code Review
