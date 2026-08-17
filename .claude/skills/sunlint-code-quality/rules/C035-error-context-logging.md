---
title: Log All Relevant Context On Errors
impact: HIGH
impactDescription: enables quick debugging and incident response
tags: error-handling, logging, context, debugging, quality
---

## Log All Relevant Context On Errors

Context-rich logs enable quick debugging. Without proper context, finding root causes is like finding a needle in a haystack.

**Incorrect (minimal context):**

```typescript
logger.error('Error occurred');
logger.error(error.message);
```

**Correct (comprehensive context):**

```typescript
logger.error('Failed to process order', {
  // What happened
  error: error.message,
  stack: error.stack,
  errorCode: error.code,
  
  // Context
  orderId: order.id,
  userId: user.id,
  requestId: ctx.requestId,
  
  // Input that caused the issue
  orderItems: order.items.length,
  totalAmount: order.total,
  
  // Timing
  timestamp: new Date().toISOString(),
  processingTimeMs: Date.now() - startTime
});
```

**Essential context:**
- Error details (message, stack, code)
- Entity identifiers
- Request/correlation IDs
- Relevant input summary
- Timing information

**Tools:** Logging framework, Observability tools
