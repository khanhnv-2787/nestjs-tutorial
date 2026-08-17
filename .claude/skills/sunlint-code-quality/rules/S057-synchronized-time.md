---
title: Use Synchronized Time (UTC) In Logs
impact: MEDIUM
impactDescription: enables accurate incident correlation
tags: logging, time, utc, synchronization, security
---

## Use Synchronized Time (UTC) In Logs

Inconsistent timestamps make incident investigation difficult. Use UTC and NTP-synchronized time.

**Incorrect (local time, inconsistent format):**

```typescript
// Local timezone - inconsistent across servers
logger.info(`Action at ${new Date()}`);

// Different formats
console.log(`[${Date.now()}] Event`);
console.log(`[${new Date().toLocaleDateString()}] Event`);
```

**Correct (UTC, ISO 8601 format):**

```typescript
// Always use UTC with ISO 8601 format
logger.info('User action', {
  timestamp: new Date().toISOString(),  // 2024-01-15T10:30:00.000Z
  userId: user.id,
  action: 'login'
});

// Configure logger to use UTC
const logger = createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
    json()
  )
});

// Structured log output
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "User action",
  "userId": "123",
  "action": "login"
}
```

**Requirements:**
- Use UTC timezone
- ISO 8601 format (YYYY-MM-DDTHH:mm:ss.SSSZ)
- NTP-synchronized servers
- Millisecond precision

**Tools:** NTP, Log aggregators, Winston/Pino
