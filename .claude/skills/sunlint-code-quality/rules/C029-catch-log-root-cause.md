---
title: All Catch Blocks Must Log Root Cause
impact: HIGH
impactDescription: enables debugging and incident response
tags: error-handling, logging, debugging, observability, quality
---

## All Catch Blocks Must Log Root Cause

Silent failures make debugging impossible. Without proper logging, you cannot trace issues in production.

**Incorrect (silent or minimal logging):**

```typescript
try {
  await processPayment(order);
} catch (e) {
  // Empty catch - silent failure!
}

try {
  await saveUser(user);
} catch (e) {
  return null; // No logging, no context
}
```

**Correct (comprehensive error logging):**

```typescript
try {
  await processPayment(order);
} catch (error) {
  logger.error('Payment processing failed', {
    orderId: order.id,
    userId: order.userId,
    amount: order.amount,
    error: error.message,
    stack: error.stack,
    requestId: context.requestId
  });
  throw new PaymentFailedError('Payment could not be processed', { cause: error });
}
```

**Log context should include:**
- Error message and stack trace
- Relevant entity IDs (order, user, etc.)
- Request/correlation ID
- Input that caused the error
- Timing information

**Tools:** Static analyzer, ESLint, PR review
