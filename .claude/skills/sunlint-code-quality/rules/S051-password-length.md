---
title: Support 12-64 Character Passwords
impact: MEDIUM
impactDescription: enables secure passphrase usage
tags: password, length, passphrase, security
---

## Support 12-64 Character Passwords

Long passwords/passphrases are more secure than complex short ones. Don't impose restrictive limits.

**Incorrect (restrictive limits):**

```typescript
const passwordSchema = z.string()
  .min(8)
  .max(16);  // Too restrictive!
```

**Correct (reasonable limits):**

```typescript
const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .max(64, 'Password cannot exceed 64 characters');

// Or with complexity options
const passwordOptions = {
  minLength: 12,
  maxLength: 64,
  // Complexity is optional with long passwords
  requireUppercase: password.length < 16,
  requireNumber: password.length < 16,
  requireSpecial: password.length < 16,
};

function validatePassword(password: string): boolean {
  if (password.length < 12 || password.length > 64) {
    return false;
  }
  
  // Long passphrases don't need symbol requirements
  if (password.length >= 16) {
    return true;
  }
  
  // Shorter passwords need complexity
  return hasUppercase(password) && 
         hasNumber(password) && 
         hasSpecial(password);
}
```

**NIST Guidelines:**
- Minimum 8 characters (12+ recommended)
- Maximum 64+ characters
- No complexity requirements for long passwords
- Allow all printable ASCII + Unicode

**Tools:** Password Policy, Manual Review
