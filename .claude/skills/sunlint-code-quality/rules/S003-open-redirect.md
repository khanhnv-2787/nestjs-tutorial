---
title: URL Redirects Must Be In Allow List
impact: LOW
impactDescription: prevents open redirect vulnerabilities
tags: redirect, url, allow-list, validation, security
---

## URL Redirects Must Be In Allow List

Open redirect vulnerabilities allow attackers to redirect users to malicious sites, often used in phishing attacks.

**Incorrect (unvalidated redirect URL):**

```typescript
// Open redirect vulnerability
app.get('/redirect', (req, res) => {
  const url = req.query.url;
  res.redirect(url);  // Attacker: ?url=https://evil.com
});

// Partial validation (can be bypassed)
app.get('/redirect', (req, res) => {
  const url = req.query.url;
  if (url.includes('example.com')) {
    res.redirect(url);  // Bypass: evil.com?example.com
  }
});
```

**Correct (allow list validation):**

```typescript
const ALLOWED_REDIRECT_HOSTS = [
  'example.com',
  'app.example.com',
  'admin.example.com'
];

app.get('/redirect', (req, res) => {
  const url = req.query.url;
  
  try {
    const parsed = new URL(url);
    
    // Validate against allow list
    if (!ALLOWED_REDIRECT_HOSTS.includes(parsed.hostname)) {
      return res.status(400).json({ error: 'Invalid redirect URL' });
    }
    
    res.redirect(url);
  } catch {
    // Invalid URL format
    res.status(400).json({ error: 'Invalid URL format' });
  }
});

// Or use relative URLs only
app.get('/redirect', (req, res) => {
  const path = req.query.path;
  
  // Only allow relative paths starting with /
  if (!path.startsWith('/') || path.startsWith('//')) {
    return res.status(400).json({ error: 'Invalid path' });
  }
  
  res.redirect(path);
});
```

**Protection strategies:**
1. Allow list of trusted domains
2. Use relative URLs only
3. Validate URL structure
4. Warning page before external redirects

**Tools:** SonarQube, Semgrep, Manual Review
