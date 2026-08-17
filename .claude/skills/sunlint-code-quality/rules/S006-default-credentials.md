---
title: Do Not Use Default Credentials
impact: CRITICAL
impactDescription: prevents trivial compromise via known credentials
tags: credentials, default, passwords, configuration, security
---

## Do Not Use Default Credentials

Default credentials are publicly known. Attackers scan for them automatically, making any system using them trivially compromised.

**Incorrect (default or hardcoded credentials):**

```yaml
# Docker Compose with defaults
services:
  postgres:
    image: postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres  # Default!
      
  redis:
    image: redis
    # No password = default open

# Application config
database:
  user: admin
  password: admin  # Default!
```

**Correct (environment/secrets management):**

```yaml
# Docker Compose with secrets
services:
  postgres:
    image: postgres
    environment:
      POSTGRES_USER: ${DB_USER}  # From env/secrets
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password

secrets:
  db_password:
    external: true  # Managed by orchestrator
```

```typescript
// Application code
const dbConfig = {
  user: process.env.DB_USER,
  password: await secretManager.getSecret('db-password'),
};

// Validate no defaults
if (dbConfig.password === 'admin' || dbConfig.password === 'password') {
  throw new Error('Default credentials detected - deployment blocked');
}
```

**Blocked defaults:**
- `admin/admin`, `root/root`, `test/test`
- `postgres/postgres`, `mysql/mysql`, `sa/sa`
- Factory default API keys

**Tools:** Secret Scanner, GitLeaks, TruffleHog, CI/CD checks
