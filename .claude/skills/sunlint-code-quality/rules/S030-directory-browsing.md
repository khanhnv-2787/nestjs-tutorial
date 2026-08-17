---
title: Disable Directory Browsing
impact: MEDIUM
impactDescription: prevents file enumeration
tags: directory, listing, file-exposure, security
---

## Disable Directory Browsing

Directory listing exposes file structure and potentially sensitive files.

**Incorrect (directory listing enabled):**

```javascript
// Express static with directory listing
app.use(express.static('public', { index: false }));

// NGINX default may allow listing
location /files/ {
  autoindex on;  // Allows listing!
}
```

**Correct (directory listing disabled):**

```javascript
// Express - no listing by default, but ensure index
app.use(express.static('public', {
  index: 'index.html',
  dotfiles: 'deny'
}));

// Custom 404 for missing files
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});
```

```nginx
# NGINX - disable autoindex
location /files/ {
  autoindex off;
  try_files $uri $uri/ =404;
}
```

```apache
# Apache - disable in .htaccess
Options -Indexes
```

**Tools:** Web server configuration, Security scan
