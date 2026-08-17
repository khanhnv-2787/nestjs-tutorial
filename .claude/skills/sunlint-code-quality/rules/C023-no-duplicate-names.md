---
title: No Duplicate Variable Names In Scope
impact: HIGH
impactDescription: prevents shadowing bugs
tags: variables, shadowing, scope, quality
---

## No Duplicate Variable Names In Scope

Variable shadowing causes subtle bugs where inner variables hide outer ones.

**Incorrect (shadowed variables):**

```typescript
const user = getCurrentUser();

function processOrder(order: Order) {
  const user = order.user;  // Shadows outer user!
  
  // Which user is this?
  console.log(user.name);
}

// Same name in nested scope
for (const item of items) {
  const item = transform(item);  // Shadows loop variable!
}
```

**Correct (unique names):**

```typescript
const currentUser = getCurrentUser();

function processOrder(order: Order) {
  const orderUser = order.user;  // Clear distinction
  
  console.log(orderUser.name);
}

// Different names in nested scope
for (const item of items) {
  const transformedItem = transform(item);
}
```

**ESLint configuration:**

```json
{
  "rules": {
    "no-shadow": "error",
    "@typescript-eslint/no-shadow": "error"
  }
}
```

**Tools:** ESLint (no-shadow), TypeScript
