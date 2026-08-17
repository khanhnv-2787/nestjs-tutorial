---
title: Limit Upload File Size And Count
impact: MEDIUM
impactDescription: prevents denial of service attacks
tags: upload, file-size, dos, limits, security
---

## Limit Upload File Size And Count

Unlimited uploads can exhaust disk space and memory, causing denial of service.

**Incorrect (no limits):**

```typescript
// No size limit
app.post('/upload', upload.single('file'), handler);

// No file count limit
app.post('/upload', upload.array('files'), handler);
```

**Correct (enforce limits):**

```typescript
import multer from 'multer';

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024,  // 5MB max
    files: 5,                    // Max 5 files
    fields: 10,                  // Max 10 form fields
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }
    cb(null, true);
  }
});

app.post('/upload', 
  upload.array('files', 5),  // Max 5 files
  (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ error: 'Too many files' });
      }
    }
    next(err);
  },
  handler
);
```

**Recommended limits:**
- Images: 5-10MB
- Documents: 10-50MB
- Max files per request: 5-10
- Total storage per user: Configurable

**Tools:** Multer, Express file limits, NGINX limits
