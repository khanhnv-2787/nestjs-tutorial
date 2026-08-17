---
title: Separate Processing And Data Access
impact: HIGH
impactDescription: enables testable business logic
tags: separation, repository, service, architecture, quality
---

## Separate Processing And Data Access

Mixing business logic with database queries creates tight coupling and makes testing require real databases.

**Incorrect (mixed concerns):**

```typescript
class OrderService {
  async calculateDiscount(userId: string) {
    // Business logic mixed with data access
    const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const orders = await db.query('SELECT * FROM orders WHERE user_id = $1', [userId]);
    
    let discount = 0;
    if (orders.length > 10) discount += 5;
    if (user.isPremium) discount += 10;
    
    return discount;
  }
}
```

**Correct (separated layers):**

```typescript
// Repository - data access only
class UserRepository {
  async findById(userId: string): Promise<User | null> {
    return db.query('SELECT * FROM users WHERE id = $1', [userId]);
  }
}

class OrderRepository {
  async findByUserId(userId: string): Promise<Order[]> {
    return db.query('SELECT * FROM orders WHERE user_id = $1', [userId]);
  }
}

// Service - business logic only
class DiscountService {
  constructor(
    private userRepo: UserRepository,
    private orderRepo: OrderRepository
  ) {}

  async calculateDiscount(userId: string): Promise<number> {
    const user = await this.userRepo.findById(userId);
    const orders = await this.orderRepo.findByUserId(userId);
    
    return this.computeDiscount(user, orders);
  }

  private computeDiscount(user: User | null, orders: Order[]): number {
    let discount = 0;
    if (orders.length > 10) discount += 5;
    if (user?.isPremium) discount += 10;
    return discount;
  }
}
```

**Tools:** Architectural review, Code Review
