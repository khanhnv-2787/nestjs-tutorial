---
title: Enable Encrypted Client Hello (ECH)
impact: MEDIUM
impactDescription: protects SNI from eavesdropping
tags: tls, ech, sni, privacy, security
---

## Enable Encrypted Client Hello (ECH)

ECH encrypts the Server Name Indication (SNI) to prevent network observers from seeing which site you're connecting to.

**About ECH:**

Encrypted Client Hello (formerly ESNI) is a TLS extension that encrypts the ClientHello message, hiding the destination hostname from network observers.

**Implementation:**

```nginx
# Nginx with ECH (when supported)
ssl_ech on;
ssl_ech_key /path/to/ech-private-key.pem;
```

**DNS Configuration:**

```
# HTTPS DNS record for ECH
_https.example.com. IN HTTPS 1 . alpn="h2,h3" ipv4hint=192.0.2.1 ech="..."
```

**Client-side (where supported):**

```typescript
// Browser support detection
if ('ECH' in navigator) {
  console.log('ECH is supported');
}
```

**Current status:**
- Experimental in most browsers
- Cloudflare supports ECH
- Requires DNS HTTPS records

**Tools:** Cloudflare ECH, DNS Configuration
