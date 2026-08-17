---
title: Use Secrets Management For Backend Secrets
impact: CRITICAL
impactDescription: centralizes and secures credential storage
tags: secrets, vault, credentials, configuration, security
---

## Use Secrets Management For Backend Secrets

Hardcoded secrets are exposed in version control and can be accessed by anyone with code access. Use dedicated secrets management systems.

**Incorrect (hardcoded or plain env files):**

```typescript
// Hardcoded in code
const API_KEY = 'sk-abc123xyz789';

// .env file committed to repo
DATABASE_URL=postgres://admin:password@localhost/db
```

**Correct (secrets management):**

```typescript
// Using secrets manager (AWS, HashiCorp Vault, etc.)
const dbPassword = await secretManager.getSecret('production/db-password');

// Kubernetes secrets
const secret = process.env.DB_PASSWORD; // Mounted from K8s secret

// Environment-specific with validation
const config = {
  dbPassword: process.env.DB_PASSWORD,
};

if (!config.dbPassword) {
  throw new Error('DB_PASSWORD environment variable required');
}
```

**Best practices:**
- Never commit secrets to version control
- Use secrets rotation
- Audit secret access
- Use different secrets per environment

**Tools:** HashiCorp Vault, AWS Secrets Manager, Azure Key Vault
