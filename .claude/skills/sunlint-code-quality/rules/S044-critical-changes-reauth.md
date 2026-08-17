---
title: Re-authenticate Before Critical Changes
impact: MEDIUM
impactDescription: prevents unauthorized critical operations
tags: authentication, critical, reauthentication, security
---

## Re-authenticate Before Critical Changes

Critical actions like password change, email change, or account deletion require fresh authentication.

**Incorrect (no re-authentication):**

```typescript
// Dangerous - no password confirmation
app.post('/account/delete', async (req, res) => {
  await deleteAccount(req.user.id);
  res.json({ success: true });
});
```

**Correct (require password confirmation):**

```typescript
app.post('/account/delete', async (req, res) => {
  const { currentPassword } = req.body;
  
  // Verify current password
  const isValid = await verifyPassword(req.user.id, currentPassword);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  
  // Rate limit this endpoint
  await rateLimiter.checkLimit(req.user.id, 'critical-action');
  
  // Perform critical action
  await deleteAccount(req.user.id);
  
  // Log the action
  logger.security('Account deleted', { userId: req.user.id });
  
  res.json({ success: true });
});

// For 2FA-enabled accounts
app.post('/account/change-email', async (req, res) => {
  const { newEmail, totpCode } = req.body;
  
  // Verify 2FA code
  const isValidTotp = await verify2FA(req.user.id, totpCode);
  if (!isValidTotp) {
    return res.status(401).json({ error: 'Invalid 2FA code' });
  }
  
  await updateEmail(req.user.id, newEmail);
  res.json({ success: true });
});
```

**Critical actions requiring re-auth:**
- Password change
- Email change
- Phone number change
- Account deletion
- Payment method changes
- Security settings changes

**Tools:** Manual Review, Security Audit
