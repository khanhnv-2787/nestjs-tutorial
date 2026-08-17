---
title: Escape Data By Output Context
impact: MEDIUM
impactDescription: ensures correct encoding for each output context
tags: xss, escaping, context, encoding, security
---

## Escape Data By Output Context

Different contexts require different escaping strategies. Using HTML encoding in a JavaScript context doesn't prevent XSS.

**Incorrect (wrong encoding for context):**

```typescript
// Wrong: same escape for all contexts
const escaped = htmlEscape(userInput);
res.send(`<script>var x = "${escaped}";</script>`);  // Still vulnerable!

// Wrong: no header injection protection
res.setHeader('X-Custom', userInput);  // Header injection!
```

**Correct (context-appropriate encoding):**

```typescript
import { escape as htmlEscape } from 'html-escaper';

// HTML content context
const htmlContent = htmlEscape(userInput);
res.send(`<p>${htmlContent}</p>`);

// JavaScript context
const jsData = JSON.stringify(userInput);
res.send(`<script>var x = ${jsData};</script>`);

// URL parameter context
const urlParam = encodeURIComponent(userInput);
res.redirect(`/search?q=${urlParam}`);

// HTTP header context - strip CRLF
const safeHeader = userInput.replace(/[\r\n]/g, '');
res.setHeader('X-Custom', safeHeader);

// Email context - prevent injection
const safeSubject = emailInput.replace(/[\r\n]/g, '');
```

**Tools:** ESLint, SonarQube, DOMPurify
