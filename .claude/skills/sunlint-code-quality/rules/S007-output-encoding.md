---
title: Output Encoding Before Interpreter Use
impact: HIGH
impactDescription: prevents XSS and injection attacks
tags: xss, encoding, output, html, security
---

## Output Encoding Before Interpreter Use

XSS and injection attacks occur when unescaped user data is interpreted by browsers or other systems.

**Incorrect (no encoding):**

```typescript
// XSS vulnerability
app.get('/search', (req, res) => {
  const query = req.query.q;
  res.send(`<h1>Results for: ${query}</h1>`);  // XSS!
});

// React dangerouslySetInnerHTML without sanitization
<div dangerouslySetInnerHTML={{ __html: userContent }} />
```

**Correct (context-aware encoding):**

```typescript
import { escape } from 'html-escaper';
import DOMPurify from 'dompurify';

// HTML context
app.get('/search', (req, res) => {
  const query = escape(req.query.q);
  res.send(`<h1>Results for: ${query}</h1>`);
});

// React - use JSX (auto-escapes)
<h1>Results for: {query}</h1>

// If HTML is needed, sanitize first
const cleanHtml = DOMPurify.sanitize(userContent);
<div dangerouslySetInnerHTML={{ __html: cleanHtml }} />

// URL context
const safeUrl = encodeURIComponent(userInput);

// JavaScript context
const safeJson = JSON.stringify(userData);
```

**Encoding by Context:**

| Context | Encoding |
|---------|----------|
| HTML body | `&lt;`, `&gt;`, `&amp;` |
| HTML attribute | Encode quotes |
| JavaScript | JSON.stringify() |
| URL | encodeURIComponent() |

**Tools:** SonarQube (S5131), Semgrep, ESLint
