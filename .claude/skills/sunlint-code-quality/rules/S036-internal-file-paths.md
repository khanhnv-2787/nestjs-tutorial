---
title: Use Internal Data For File Paths
impact: CRITICAL
impactDescription: prevents path traversal attacks
tags: file-path, path-traversal, lfi, input-validation, security
---

## Use Internal Data For File Paths

Never construct file paths using user input directly. Path traversal attacks can access any file on the system.

**Incorrect (user-controlled paths):**

```typescript
// Path traversal vulnerability
app.get('/download', (req, res) => {
  const filename = req.query.file;
  res.sendFile(`/uploads/${filename}`);
  // Attacker: ?file=../../../etc/passwd
});
```

**Correct (validated internal paths):**

```typescript
import path from 'path';

app.get('/download', (req, res) => {
  const filename = req.query.file;
  
  // Sanitize: remove path components
  const safeName = path.basename(filename);
  
  // Validate against allowlist
  const allowedFiles = await getUploadedFiles(req.user.id);
  if (!allowedFiles.includes(safeName)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Use absolute path with validation
  const filePath = path.join('/uploads', safeName);
  const resolved = path.resolve(filePath);
  
  // Ensure path is within allowed directory
  if (!resolved.startsWith('/uploads/')) {
    return res.status(400).json({ error: 'Invalid path' });
  }
  
  res.sendFile(resolved);
});
```

**Tools:** SonarQube, Semgrep, OWASP ZAP
