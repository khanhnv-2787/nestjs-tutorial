---
title: No Hardcoded Secrets In Repo
impact: HIGH
impactDescription: prevents credential exposure
tags: secrets, credentials, security, git, quality
---

## No Hardcoded Secrets In Repo

Secrets in code are exposed to everyone with repo access and can be scraped by attackers.

**Incorrect (secrets in code):**

```typescript
const API_KEY = 'sk-abc123xyz789';
const DB_PASSWORD = 'admin123';

fetch('https://api.stripe.com/v1/charges', {
  headers: { 'Authorization': 'Bearer sk_live_xxx' }
});
```

**Correct (environment/secrets manager):**

```typescript
// From environment
const API_KEY = process.env.API_KEY;

// From secrets manager
const apiKey = await secretManager.getSecret('stripe-api-key');

// Validation at startup
if (!process.env.API_KEY) {
  throw new Error('API_KEY environment variable is required');
}
```

```gitignore
# .gitignore
.env
.env.local
*.pem
*.key
secrets/
```

**Tools:** GitLeaks, TruffleHog, pre-commit hooks
