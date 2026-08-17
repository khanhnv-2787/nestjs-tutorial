---
title: Do Not Use Error Log For Non-critical
impact: HIGH
impactDescription: prevents alert fatigue and log noise
tags: logging, log-levels, error, observability, quality
---

## Do Not Use Error Log For Non-critical

Incorrect log levels cause alert fatigue and hide real issues. When everything is an "error", nothing is.

**Incorrect (overusing error level):**

```typescript
// NOT an error - expected business case
logger.error('User entered wrong password');

// NOT an error - validation failure
logger.error('Email format invalid');

// NOT an error - temporary network issue
logger.error('Retry attempt 2 of 5');
```

**Correct (appropriate log levels):**

```typescript
// WARN - recoverable, may need attention
logger.warn('Payment retry attempt', { attempt: 2, maxAttempts: 5 });

// INFO - normal business events
logger.info('Login failed - invalid password', { userId, attempts: 3 });

// DEBUG - detailed troubleshooting
logger.debug('Validation failed', { field: 'email', value: maskedEmail });

// ERROR - only for actual system failures
logger.error('Database connection lost', { host: dbHost, error });
```

**Log Level Guide:**

| Level | Use For |
|-------|---------|
| ERROR | System failures, crashes, unrecoverable |
| WARN | Potential issues, degraded performance |
| INFO | Business events, state changes |
| DEBUG | Detailed troubleshooting |

**Tools:** Log linter, Custom rule
