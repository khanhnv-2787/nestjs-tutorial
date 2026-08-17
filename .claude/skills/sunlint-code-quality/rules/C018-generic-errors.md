---
title: Do Not Throw Generic Errors
impact: HIGH
impactDescription: enables proper error handling and monitoring
tags: error-handling, exceptions, custom-errors, debugging, quality
---

## Do Not Throw Generic Errors

Generic errors lack context needed for debugging. They make it impossible to distinguish between error types for proper handling.

**Incorrect (generic errors):**

```typescript
if (!user) {
  throw new Error("error");
}

if (!isValid) {
  throw new RuntimeException();
}
```

**Correct (specific custom errors):**

```typescript
if (!user) {
  throw new UserNotFoundError(`User with ID ${userId} not found in database`);
}

if (!isValid) {
  throw new ValidationError({
    field: 'email',
    message: 'Email format is invalid',
    value: email,
    code: 'INVALID_EMAIL_FORMAT'
  });
}
```

Custom errors should include:
- Descriptive message with context
- Error code for programmatic handling
- Relevant data for debugging
- Appropriate HTTP status mapping

**Tools:** Linter, Manual review
