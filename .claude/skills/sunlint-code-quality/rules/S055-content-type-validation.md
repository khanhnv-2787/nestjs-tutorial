---
title: Validate Content-Type In REST Services
impact: MEDIUM
impactDescription: prevents content-type confusion attacks
tags: rest, content-type, validation, api, security
---

## Validate Content-Type In REST Services

Accepting unexpected content types can lead to parsing vulnerabilities and bypass security controls.

**Incorrect (accepting any content):**

```typescript
// No content-type validation
app.post('/api/data', (req, res) => {
  // Accepts anything - XML, form data, etc.
  processData(req.body);
});
```

**Correct (strict content-type validation):**

```typescript
// Express middleware to validate content-type
const validateContentType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.get('Content-Type');
    
    if (!contentType) {
      return res.status(415).json({ error: 'Content-Type header required' });
    }
    
    const isAllowed = allowedTypes.some(type => 
      contentType.toLowerCase().includes(type)
    );
    
    if (!isAllowed) {
      return res.status(415).json({ 
        error: 'Unsupported Media Type',
        allowed: allowedTypes
      });
    }
    
    next();
  };
};

app.post('/api/data', 
  validateContentType(['application/json']),
  (req, res) => {
    processData(req.body);
  }
);

// For file uploads
app.post('/api/upload',
  validateContentType(['multipart/form-data']),
  upload.single('file'),
  handleUpload
);
```

**Tools:** API Gateway, Manual Review, OWASP ZAP
