---
title: TLS Encryption For All Connections
impact: CRITICAL
impactDescription: protects data in transit from interception
tags: tls, encryption, https, transport, security
---

## TLS Encryption For All Connections

All network communications must use TLS to prevent eavesdropping and man-in-the-middle attacks.

**Incorrect (unencrypted connections):**

```typescript
// HTTP instead of HTTPS
fetch('http://api.example.com/data');

// Unencrypted database connection
mongoose.connect('mongodb://db.example.com/app');
```

**Correct (TLS everywhere):**

```typescript
// HTTPS for all external calls
fetch('https://api.example.com/data');

// TLS for database
mongoose.connect('mongodb://db.example.com/app', {
  tls: true,
  tlsCAFile: '/path/to/ca.pem'
});

// HSTS header to force HTTPS
app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true
}));
```

**Requirements:**
- All HTTP endpoints must redirect to HTTPS
- Database connections must use TLS
- Internal service-to-service calls must use TLS
- HSTS headers should be enabled

**Tools:** SSLyze, OWASP ZAP, Qualys SSL Labs
