---
title: Do Not Hardcode Configuration
impact: HIGH
impactDescription: enables environment-specific deployments
tags: configuration, environment, deployment, quality
---

## Do Not Hardcode Configuration

Hardcoded config requires code changes to deploy to different environments.

**Incorrect (hardcoded config):**

```typescript
const API_URL = 'https://api.production.example.com';
const TIMEOUT = 5000;
const MAX_FILE_SIZE = 10485760;
```

**Correct (externalized config):**

```typescript
// config.ts
const config = {
  api: {
    url: process.env.API_URL || 'http://localhost:3000',
    timeout: parseInt(process.env.API_TIMEOUT || '5000'),
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
  },
  features: {
    newDashboard: process.env.FEATURE_NEW_DASHBOARD === 'true',
  },
};

// Validate at startup
const required = ['API_URL', 'DATABASE_URL'];
for (const envVar of required) {
  if (!process.env[envVar]) {
    throw new Error(`Missing: ${envVar}`);
  }
}

export default config;

// Usage
import config from './config';
fetch(`${config.api.url}/users`, { timeout: config.api.timeout });
```

**Tools:** dotenv, config libraries, Manual review
