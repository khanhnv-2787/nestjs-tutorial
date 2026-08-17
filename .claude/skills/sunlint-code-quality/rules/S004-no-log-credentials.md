---
title: Do Not Log Credentials Or Tokens
impact: MEDIUM
impactDescription: prevents credential exposure in logs
tags: logging, credentials, tokens, secrets, security
---

## Do Not Log Credentials Or Tokens

Logs are often stored unencrypted and accessed by many people. Credentials in logs can be harvested by attackers or accidentally exposed.

**Incorrect (logging sensitive data):**

```typescript
// Logging passwords
logger.info('Login attempt', { 
  username: user.username, 
  password: user.password  // NEVER!
});

// Logging tokens
logger.debug('Request headers', { headers: req.headers });
// Authorization header contains token!

// Logging full request
logger.info('Incoming request', { body: req.body });
// May contain password, credit card, etc.
```

**Correct (sanitized logging):**

```typescript
// Mask or omit sensitive fields
logger.info('Login attempt', { 
  username: user.username,
  // password omitted
});

// Sanitize headers
const safeHeaders = {
  ...req.headers,
  authorization: req.headers.authorization ? '[REDACTED]' : undefined,
  cookie: req.headers.cookie ? '[REDACTED]' : undefined
};
logger.debug('Request headers', { headers: safeHeaders });

// Use sanitizer for request body
function sanitizeForLog(obj: Record<string, any>): Record<string, any> {
  const sensitiveFields = ['password', 'token', 'secret', 'credit_card', 'ssn'];
  const sanitized = { ...obj };
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

logger.info('Incoming request', { body: sanitizeForLog(req.body) });
```

**Never log:**
- Passwords (plaintext or hashed)
- API keys and tokens
- Credit card numbers
- Social Security Numbers
- Session identifiers

**Tools:** SonarQube, Semgrep, Log Audit
