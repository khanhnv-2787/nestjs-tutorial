---
title: Do Not Use Dead Code
impact: LOW
impactDescription: reduces codebase noise and bundle size
tags: dead-code, cleanup, maintenance, quality
---

## Do Not Use Dead Code

Dead code confuses readers and increases bundle size. Git history preserves deleted code.

**Incorrect (keeping dead code):**

```typescript
function processOrder(order: Order) {
  // Old implementation - keeping for reference
  // const total = order.items.reduce((sum, item) => {
  //   return sum + item.price * item.quantity;
  // }, 0);
  
  const total = calculateTotal(order);
  return total;
}

// Unused function - someone might need it later
function legacyCalculation() { }

import { unusedHelper } from './utils';  // Never used
```

**Correct (clean code):**

```typescript
function processOrder(order: Order) {
  const total = calculateTotal(order);
  return total;
}

// Delete unused functions - git history preserves them
// Delete commented code - git history preserves it
// Remove unused imports
```

**Types of dead code:**
- Commented-out code
- Unused functions/classes
- Unused imports
- Unreachable code
- Unused variables

**Tools:** ESLint, TypeScript strict, Tree shaking
