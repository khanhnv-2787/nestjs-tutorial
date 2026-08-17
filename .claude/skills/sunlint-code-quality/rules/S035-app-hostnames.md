---
title: Host Apps On Different Hostnames
impact: MEDIUM
impactDescription: provides cookie and origin isolation
tags: hostname, isolation, same-origin, security
---

## Host Apps On Different Hostnames

Different applications on the same hostname can access each other's cookies and storage.

**Incorrect (shared hostname):**

```
https://example.com/admin    # Admin panel
https://example.com/api      # API
https://example.com/app      # User app
# All share cookies and localStorage!
```

**Correct (separate hostnames):**

```
https://admin.example.com    # Admin panel
https://api.example.com      # API
https://app.example.com      # User app
# Each has isolated cookies and storage
```

**Benefits:**
- Cookie isolation
- localStorage isolation
- Same-origin policy protection
- Independent security policies

**Configuration:**

```typescript
// CORS for separate origins
app.use(cors({
  origin: [
    'https://app.example.com',
    'https://admin.example.com'
  ],
  credentials: true
}));
```

**Tools:** Infrastructure Planning, Security Audit
