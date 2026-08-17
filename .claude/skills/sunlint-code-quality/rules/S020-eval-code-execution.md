---
title: Avoid Eval Or Dynamic Code Execution
impact: HIGH
impactDescription: prevents remote code execution vulnerabilities
tags: eval, code-execution, rce, injection, security
---

## Avoid Eval Or Dynamic Code Execution

`eval()` and similar functions execute arbitrary code, making them extremely dangerous with user input. Attackers can run any code on your server.

**Incorrect (dynamic code execution):**

```typescript
// eval() with user input
const formula = req.body.formula;
const result = eval(formula);  // RCE vulnerability!

// new Function() with user input
const fn = new Function('x', userCode);

// setTimeout with string
setTimeout(userInput, 1000);  // Executes as code!

// Dynamic require
const module = require(userInput);  // Path traversal + RCE
```

**Correct (safe alternatives):**

```typescript
// Use a safe expression parser
import { evaluate } from 'mathjs';
const result = evaluate(formula, { x: 10 }); // Limited to math

// Use switch/object mapping for dynamic behavior
const operations: Record<string, (a: number, b: number) => number> = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
};

const operation = operations[req.body.operation];
if (!operation) throw new Error('Invalid operation');
const result = operation(a, b);

// Use JSON.parse for data (not eval)
const data = JSON.parse(jsonString);

// Allowlist for dynamic imports
const allowedModules = ['module-a', 'module-b'];
if (!allowedModules.includes(moduleName)) {
  throw new Error('Module not allowed');
}
const module = require(`./${moduleName}`);
```

**Tools:** ESLint (`no-eval`), Semgrep, SonarQube (S1523)
