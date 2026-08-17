---
title: Protect Against SSRF Attacks
impact: MEDIUM
impactDescription: prevents internal network access from user input
tags: ssrf, url, network, internal, security
---

## Protect Against SSRF Attacks

SSRF allows attackers to make requests from your server to internal services or cloud metadata endpoints.

**Incorrect (accepting user URLs without validation):**

```typescript
app.get('/fetch', async (req, res) => {
  const url = req.query.url;
  const response = await fetch(url);  // Attacker controls URL!
  res.send(await response.text());
});
// Attacker: ?url=http://169.254.169.254/latest/meta-data/
```

**Correct (URL validation and blocking):**

```typescript
import { URL } from 'url';
import ipRangeCheck from 'ip-range-check';

const BLOCKED_IPS = [
  '127.0.0.0/8',      // Localhost
  '10.0.0.0/8',       // Private
  '172.16.0.0/12',    // Private
  '192.168.0.0/16',   // Private
  '169.254.0.0/16',   // Link-local (AWS metadata!)
];

const ALLOWED_HOSTS = ['api.example.com', 'cdn.example.com'];

async function safeFetch(userUrl: string): Promise<Response> {
  const parsed = new URL(userUrl);
  
  // Protocol whitelist
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Protocol not allowed');
  }
  
  // Host whitelist (preferred)
  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    throw new Error('Host not allowed');
  }
  
  // IP block list (if dynamic hosts needed)
  const ip = await dns.resolve(parsed.hostname);
  if (BLOCKED_IPS.some(range => ipRangeCheck(ip, range))) {
    throw new Error('IP range not allowed');
  }
  
  // No redirects
  return fetch(userUrl, { redirect: 'error' });
}
```

**Tools:** SonarQube, Manual Review, Burp Suite
