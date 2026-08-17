---
title: TLS Clients Must Validate Server Certificates
impact: CRITICAL
impactDescription: prevents man-in-the-middle attacks
tags: tls, certificates, validation, mitm, security
---

## TLS Clients Must Validate Server Certificates

Disabling certificate validation makes TLS useless - attackers can intercept all traffic with self-signed certificates.

**Incorrect (disabled validation):**

```typescript
// Node.js - DANGEROUS
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Axios - DANGEROUS
axios.get('https://api.example.com', {
  httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

// Python - DANGEROUS
requests.get('https://api.example.com', verify=False)
```

**Correct (proper validation):**

```typescript
// Default behavior - validates certificates
axios.get('https://api.example.com');

// Custom CA for internal services
const agent = new https.Agent({
  ca: fs.readFileSync('/path/to/internal-ca.pem'),
  rejectUnauthorized: true
});

axios.get('https://internal-api.example.com', { httpsAgent: agent });
```

```python
# Python - with custom CA
import certifi
requests.get('https://api.example.com', verify=certifi.where())

# Or with internal CA
requests.get('https://internal.example.com', verify='/path/to/ca.pem')
```

**Tools:** SSL Labs, testssl.sh, OWASP ZAP
