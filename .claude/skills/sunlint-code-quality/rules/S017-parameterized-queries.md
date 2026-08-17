---
title: Always Use Parameterized Queries
impact: CRITICAL
impactDescription: prevents SQL and NoSQL injection attacks
tags: injection, sql, nosql, database, parameterized, security
---

## Always Use Parameterized Queries

SQL injection is one of the top security vulnerabilities. Direct string concatenation allows attackers to execute arbitrary database commands, steal data, or destroy databases.

**Incorrect (string concatenation):**

```typescript
// SQL Injection vulnerability
const userId = req.params.id;
const query = `SELECT * FROM users WHERE id = '${userId}'`;
const user = await db.query(query);

// Attacker input: ' OR '1'='1
// Resulting query: SELECT * FROM users WHERE id = '' OR '1'='1'
// Returns ALL users!
```

```javascript
// NoSQL Injection in MongoDB
const user = await User.findOne({ 
  username: req.body.username,
  password: req.body.password  // Attacker can pass { "$gt": "" }
});
```

**Correct (parameterized queries):**

```typescript
// Parameterized query - SQL
const userId = req.params.id;
const user = await db.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);

// Using ORM with type safety
const user = await userRepository.findOne({ 
  where: { id: userId }
});

// Safe MongoDB query
const user = await User.findOne({ 
  username: String(req.body.username),
  password: String(req.body.password)
}).exec();
```

**Tools:** SonarQube (S2077, S3649), Semgrep, CodeQL
