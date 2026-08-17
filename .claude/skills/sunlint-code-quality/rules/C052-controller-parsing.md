---
title: Separate Parsing From Controllers
impact: HIGH
impactDescription: keeps controllers thin and focused
tags: controller, parsing, transformation, patterns, quality
---

## Separate Parsing From Controllers

Controllers should be thin - only handling HTTP concerns. Transformation logic should be extracted.

**Incorrect (transformation in controller):**

```typescript
class UserController {
  async getUser(req: Request, res: Response) {
    const user = await this.userService.findById(req.params.id);
    
    // Transformation logic in controller
    const response = {
      id: user.id,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email.toLowerCase(),
      createdAt: format(user.createdAt, 'yyyy-MM-dd'),
      age: differenceInYears(new Date(), user.birthDate)
    };
    
    res.json(response);
  }
}
```

**Correct (separate mapper):**

```typescript
// Mapper/Transformer
class UserMapper {
  static toResponse(user: User): UserResponse {
    return {
      id: user.id,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email.toLowerCase(),
      createdAt: format(user.createdAt, 'yyyy-MM-dd'),
      age: differenceInYears(new Date(), user.birthDate)
    };
  }
}

// Clean controller
class UserController {
  async getUser(req: Request, res: Response) {
    const user = await this.userService.findById(req.params.id);
    res.json(UserMapper.toResponse(user));
  }
}
```

**Benefits:**
- Reusable transformation logic
- Testable mappers
- Clean controllers
- Consistent response format

**Tools:** Code review, Architecture rules
