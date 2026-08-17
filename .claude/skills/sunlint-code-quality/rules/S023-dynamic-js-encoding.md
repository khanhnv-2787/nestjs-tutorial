---
title: Output Encoding For Dynamic JS/JSON
impact: HIGH
impactDescription: prevents injection in JavaScript contexts
tags: xss, javascript, json, encoding, security
---

## Output Encoding For Dynamic JS/JSON

Embedding user data in JavaScript or JSON requires proper encoding to prevent code injection.

**Incorrect (unescaped data in JS):**

```typescript
// XSS in inline script
app.get('/profile', (req, res) => {
  const username = req.user.name;  // "</script><script>alert('xss')"
  res.send(`<script>var user = "${username}";</script>`);
});
```

**Correct (proper JSON encoding):**

```typescript
app.get('/profile', (req, res) => {
  const userData = {
    name: req.user.name,
    email: req.user.email
  };
  
  // JSON.stringify properly escapes special characters
  const safeData = JSON.stringify(userData);
  
  res.send(`
    <script>
      var user = ${safeData};
    </script>
  `);
});

// For React/Next.js - pass via props
<script
  dangerouslySetInnerHTML={{
    __html: `window.__INITIAL_DATA__ = ${JSON.stringify(data)}`
  }}
/>

// Better: use data attributes
<div id="app" data-user={JSON.stringify(user)}></div>
```

**Tools:** ESLint, SonarQube, Manual Review
