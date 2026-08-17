---
title: Validate mTLS Certificates Before Auth
impact: CRITICAL
impactDescription: ensures mutual authentication between services
tags: mtls, certificates, authentication, service-mesh, security
---

## Validate mTLS Certificates Before Auth

Mutual TLS ensures both parties are authenticated. Always validate client certificates before processing requests.

**Incorrect (skipping certificate validation):**

```typescript
// Accepting any client certificate
const server = https.createServer({
  requestCert: true,
  rejectUnauthorized: false  // DANGEROUS!
}, app);
```

**Correct (proper mTLS validation):**

```typescript
const server = https.createServer({
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem'),
  ca: fs.readFileSync('ca-cert.pem'),
  requestCert: true,
  rejectUnauthorized: true  // Reject invalid certificates
}, app);

// Additional validation in middleware
app.use((req, res, next) => {
  const cert = req.socket.getPeerCertificate();
  
  if (!cert || !cert.subject) {
    return res.status(401).json({ error: 'Client certificate required' });
  }
  
  // Validate certificate attributes
  if (!allowedServices.includes(cert.subject.CN)) {
    return res.status(403).json({ error: 'Service not authorized' });
  }
  
  next();
});
```

**Tools:** OpenSSL, Certificate Pinning, Service Mesh (Istio, Linkerd)
