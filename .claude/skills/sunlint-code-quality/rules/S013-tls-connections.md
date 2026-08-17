---
title: Always Use TLS For All Connections
impact: HIGH
impactDescription: protects data in transit from eavesdropping
tags: tls, https, encryption, transport, security
---

## Always Use TLS For All Connections

Unencrypted traffic exposes data to anyone on the network path - ISPs, WiFi operators, and attackers.

**Incorrect (unencrypted connections):**

```typescript
// HTTP API calls
fetch('http://api.example.com/users');

// Unencrypted database
mongoose.connect('mongodb://db.example.com:27017/app');

// Redis without TLS
const redis = new Redis({ host: 'redis.example.com', port: 6379 });
```

**Correct (TLS everywhere):**

```typescript
// HTTPS for all APIs
fetch('https://api.example.com/users');

// TLS for database
mongoose.connect('mongodb://db.example.com:27017/app', {
  tls: true,
  tlsCAFile: '/path/to/ca.pem'
});

// Redis with TLS
const redis = new Redis({
  host: 'redis.example.com',
  port: 6380,
  tls: {
    ca: fs.readFileSync('/path/to/ca.pem')
  }
});

// Force HTTPS in Express
app.use((req, res, next) => {
  if (!req.secure && process.env.NODE_ENV === 'production') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// HSTS header
app.use(helmet.hsts({
  maxAge: 31536000,  // 1 year
  includeSubDomains: true,
  preload: true
}));
```

**Checklist:**
- [ ] All HTTP → HTTPS
- [ ] Database connections encrypted
- [ ] Redis/memcached TLS
- [ ] Message queues TLS
- [ ] HSTS headers enabled
- [ ] No localhost exceptions in production

**Tools:** OWASP ZAP, SSLyze, Lighthouse
