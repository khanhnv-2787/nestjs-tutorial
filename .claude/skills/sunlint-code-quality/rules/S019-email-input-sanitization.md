---
title: Sanitize Input Before Sending Emails
impact: MEDIUM
impactDescription: prevents email header injection
tags: email, injection, sanitization, input-validation, security
---

## Sanitize Input Before Sending Emails

Email header injection allows attackers to add recipients, change headers, or send spam through your system.

**Incorrect (unsanitized email input):**

```typescript
// Email injection vulnerability
const subject = req.body.subject;  // "Hello\r\nBcc: spam@evil.com"
await sendEmail({
  to: user.email,
  subject: subject,  // Injects headers!
  body: 'Your message'
});
```

**Correct (sanitized email fields):**

```typescript
function sanitizeEmailField(input: string): string {
  // Remove CRLF characters that could inject headers
  return input.replace(/[\r\n]/g, '').trim();
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && !email.includes('\n');
}

app.post('/contact', async (req, res) => {
  const { to, subject, body } = req.body;
  
  // Validate email address
  if (!validateEmail(to)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  
  // Sanitize all text fields
  await sendEmail({
    to: sanitizeEmailField(to),
    subject: sanitizeEmailField(subject),
    body: body  // Body can contain newlines, but sanitize if templating
  });
  
  res.json({ success: true });
});
```

**Tools:** Email Libraries with Built-in Protection, Manual Review
