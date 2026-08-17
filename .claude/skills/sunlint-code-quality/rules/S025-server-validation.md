---
title: Always Validate Client Data Server-side
impact: MEDIUM
impactDescription: ensures input validation cannot be bypassed
tags: validation, server-side, input, sanitization, security
---

## Always Validate Client Data Server-side

Client-side validation is for UX only - it can be bypassed easily. All input must be validated server-side.

**Incorrect (trusting client validation):**

```typescript
// No server validation - trusting frontend
app.post('/transfer', async (req, res) => {
  const { amount, toAccount } = req.body;
  await transferMoney(req.user.id, toAccount, amount);
  res.json({ success: true });
});
```

**Correct (comprehensive server validation):**

```typescript
import { z } from 'zod';

const transferSchema = z.object({
  amount: z.number().positive().max(10000),
  toAccount: z.string().regex(/^[A-Z]{2}\d{18}$/)  // IBAN format
});

app.post('/transfer', async (req, res) => {
  // Validate everything server-side
  const result = transferSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues });
  }
  
  const { amount, toAccount } = result.data;
  
  // Additional business validation
  const account = await findAccount(toAccount);
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }
  
  await transferMoney(req.user.id, toAccount, amount);
  res.json({ success: true });
});
```

**Validation types:**

| Type | What to Check |
|------|---------------|
| Format | Email, phone, UUID, dates |
| Range | Min/max values, string length |
| Business | Account exists, permissions |
| Sanitization | Strip dangerous chars |

**Tools:** Zod, Joi, class-validator, SonarQube
