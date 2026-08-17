---
title: Validate OAuth Redirect URIs Exactly
impact: CRITICAL
impactDescription: prevents OAuth redirect hijacking
tags: oauth, redirect, uri, validation, security
---

## Validate OAuth Redirect URIs Exactly

Loose redirect URI validation allows attackers to steal authorization codes by redirecting users to malicious sites.

**Incorrect (partial validation):**

```typescript
// Dangerous - substring match
if (redirectUri.includes('example.com')) {
  // Allows evil.com?example.com
}

// Dangerous - prefix match only
if (redirectUri.startsWith('https://example.com')) {
  // Allows https://example.com.evil.com
}
```

**Correct (exact match against registered URIs):**

```typescript
const REGISTERED_REDIRECT_URIS = [
  'https://app.example.com/callback',
  'https://mobile.example.com/oauth/callback'
];

function validateRedirectUri(uri: string): boolean {
  // Exact match required
  return REGISTERED_REDIRECT_URIS.includes(uri);
}

app.get('/oauth/authorize', (req, res) => {
  const { redirect_uri, client_id } = req.query;
  
  // Get registered URIs for this client
  const client = await getClient(client_id);
  
  if (!client.redirectUris.includes(redirect_uri)) {
    return res.status(400).json({ error: 'invalid_redirect_uri' });
  }
  
  // Proceed with authorization
});
```

**Requirements:**
- Exact string match for redirect URIs
- Pre-registered URIs per client
- No wildcards or pattern matching
- HTTPS required for production

**Tools:** OAuth Security Testing, Manual Review
