---
title: Protect Against Log Injection
impact: HIGH
impactDescription: prevents log forging and exploitation
tags: logging, injection, sanitization, security
---

## Protect Against Log Injection

Log injection allows attackers to forge log entries, hide their tracks, or inject malicious content.

**Incorrect (unsanitized logging):**

```typescript
// Log injection vulnerability
const username = req.body.username;
logger.info(`User logged in: ${username}`);
// Attacker: "admin\n[ERROR] Payment failed for user: victim"
```

**Correct (sanitized structured logging):**

```typescript
// Use structured logging
logger.info('User logged in', { 
  username: sanitizeForLog(username),
  ip: req.ip,
  timestamp: new Date().toISOString()
});

// Sanitize log input
function sanitizeForLog(input: string): string {
  return input
    .replace(/[\r\n\t]/g, ' ')  // Remove control chars
    .replace(/[^\x20-\x7E]/g, '')  // ASCII only
    .substring(0, 200);  // Limit length
}

// JSON structured logs (harder to forge)
console.log(JSON.stringify({
  level: 'info',
  message: 'User action',
  data: { username: sanitizeForLog(username) },
  timestamp: new Date().toISOString()
}));
```

**Tools:** SonarQube, Semgrep, Manual Review
