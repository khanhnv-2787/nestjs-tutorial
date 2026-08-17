---
title: Do Not Import Unused Modules
impact: LOW
impactDescription: reduces bundle size and improves clarity
tags: imports, cleanup, bundle-size, quality
---

## Do Not Import Unused Modules

Unused imports add noise and increase bundle sizes.

**Incorrect (unused imports):**

```typescript
import { User, Order, Product, Category } from './models';
import { formatDate, parseDate } from 'date-utils';
import _ from 'lodash';

// Only User is actually used
function getUser(id: string): User {
  return db.findById(id);
}
```

**Correct (only needed imports):**

```typescript
import { User } from './models';

function getUser(id: string): User {
  return db.findById(id);
}
```

**Auto-removal:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}

// .eslintrc
{
  "rules": {
    "no-unused-vars": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

**Tools:** ESLint, TypeScript, IDE auto-organize
