---
title: Use Custom Error Classes
impact: HIGH
impactDescription: enables proper error categorization and handling
tags: error-handling, custom-errors, exceptions, patterns, quality
---

## Use Custom Error Classes

Custom error classes enable proper error handling, categorization, and monitoring. They provide clear contracts for API consumers.

**Incorrect (generic errors):**

```typescript
throw new Error("User not found");
throw new Error("Invalid input");
throw new Error("Database connection failed");
```

**Correct (custom error hierarchy):**

```typescript
// Base application error
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Specific errors
class UserNotFoundError extends AppError {
  constructor(userId: string) {
    super(`User ${userId} not found`, 'USER_NOT_FOUND', 404, { userId });
  }
}

class ValidationError extends AppError {
  constructor(field: string, message: string) {
    super(message, 'VALIDATION_ERROR', 400, { field });
  }
}

// Usage
throw new UserNotFoundError(userId);
throw new ValidationError('email', 'Invalid email format');
```

**Benefits:**
- Type-safe error handling
- Automatic HTTP status mapping
- Structured error context
- Consistent error format

**Tools:** Linter, Convention
