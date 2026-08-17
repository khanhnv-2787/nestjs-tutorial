---
title: Function Names Verb-Noun
impact: LOW
impactDescription: makes code self-documenting
tags: naming, functions, readability, conventions, quality
---

## Function Names Verb-Noun

Functions do things. Action verbs make purpose clear.

**Incorrect (vague names):**

```typescript
function user() { }           // Noun only
function userData() { }       // Noun only
function doSomething() { }    // Vague
function handleStuff() { }    // Vague
function manager() { }        // Noun only
```

**Correct (action verbs):**

```typescript
function getUser() { }
function createUserAccount() { }
function validateEmailFormat() { }
function calculateTotalPrice() { }
function sendConfirmationEmail() { }
function convertCurrencyToUSD() { }
```

**Verb categories:**

| Category | Verbs |
|----------|-------|
| Retrieval | `get`, `fetch`, `find`, `load`, `query` |
| Creation | `create`, `build`, `make`, `generate` |
| Modification | `set`, `update`, `modify`, `change` |
| Deletion | `delete`, `remove`, `destroy`, `clear` |
| Validation | `validate`, `verify`, `check`, `ensure` |
| Computation | `calculate`, `compute`, `parse`, `format` |
| Boolean | `is`, `has`, `can`, `should`, `will` |

**Tools:** PR review, Linter
