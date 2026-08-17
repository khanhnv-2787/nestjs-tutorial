---
title: Boolean Names Is/Has/Should
impact: HIGH
impactDescription: makes conditions instantly readable
tags: naming, booleans, readability, quality
---

## Boolean Names Is/Has/Should

Boolean prefixes make conditions instantly readable.

**Incorrect (unclear boolean names):**

```typescript
const active = user.status === 'active';
const admin = checkAdminRole(user);
const items = cart.length > 0;
const update = needsRefresh();
```

**Correct (boolean prefixes):**

```typescript
const isActive = user.status === 'active';
const isAdmin = checkAdminRole(user);
const hasItems = cart.length > 0;
const shouldUpdate = needsRefresh();
const canEdit = hasPermission(user, 'edit');
const willExpire = expirationDate < tomorrow;
```

**Boolean prefixes:**

| Prefix | Use For |
|--------|---------|
| `is` | State (isActive, isEnabled) |
| `has` | Ownership (hasPermission, hasError) |
| `should` | Decision (shouldUpdate, shouldRetry) |
| `can` | Capability (canEdit, canDelete) |
| `will` | Future (willExpire, willRetry) |

**Tools:** Linter, Code Review
