---
title: Do Not Leave Unused Variables
impact: LOW
impactDescription: reduces code noise and potential bugs
tags: variables, cleanup, quality
---

## Do Not Leave Unused Variables

Unused variables suggest incomplete refactoring or bugs.

**Incorrect (unused variables):**

```typescript
function processOrder(order: Order) {
  const user = order.user;      // Never used
  const total = order.total;    // Never used
  const items = order.items;
  
  return items.map(i => i.name);
}
```

**Correct (only needed variables):**

```typescript
function processOrder(order: Order) {
  return order.items.map(i => i.name);
}

// If destructuring, use underscore prefix for intentionally ignored
function handleEvent({ type, _payload }: Event) {
  console.log(`Event: ${type}`);
  // _payload intentionally unused
}
```

**Configuration:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "noUnusedLocals": true
  }
}

// ESLint
{
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }]
  }
}
```

**Tools:** ESLint, TypeScript compiler
