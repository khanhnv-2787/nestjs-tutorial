---
title: Do Not Ignore Superclass Logic
impact: HIGH
impactDescription: ensures proper inheritance behavior
tags: inheritance, override, superclass, oop, quality
---

## Do Not Ignore Superclass Logic

When overriding methods, ensure superclass behavior is preserved unless explicitly intended otherwise.

**Incorrect (ignoring superclass):**

```typescript
class BaseService {
  async save(entity: Entity) {
    this.validate(entity);
    await this.beforeSave(entity);
    await this.repository.save(entity);
    await this.afterSave(entity);
  }
}

class UserService extends BaseService {
  async save(user: User) {
    // Completely ignores validation, hooks, etc.
    await this.repository.save(user);
  }
}
```

**Correct (calling super):**

```typescript
class UserService extends BaseService {
  async save(user: User) {
    // Add user-specific preprocessing
    user.updatedAt = new Date();
    
    // Call superclass implementation
    await super.save(user);
    
    // Add user-specific postprocessing
    await this.updateSearchIndex(user);
  }
}
```

**When to skip super:**
- Complete replacement is intentional
- Base implementation doesn't apply
- Document the reason clearly

```typescript
class UserService extends BaseService {
  /**
   * Override: Users require special validation,
   * base validation is not applicable.
   */
  async save(user: User) {
    await this.validateUser(user);
    // Intentionally not calling super
  }
}
```

**Tools:** Static Analysis, Code Review
