---
title: Use Dependency Injection
impact: HIGH
impactDescription: enables testability and loose coupling
tags: dependency-injection, testing, coupling, architecture, quality
---

## Use Dependency Injection

Direct instantiation creates tight coupling, making testing difficult and changes risky. DI enables mockability, replaceability, and testability.

**Incorrect (hardcoded dependencies):**

```typescript
class OrderService {
  private db = new DatabaseConnection(); // Hardcoded dependency
  private mailer = new EmailService();   // Hardcoded dependency

  async createOrder(data: OrderData) {
    const order = await this.db.insert('orders', data);
    await this.mailer.send(data.email, 'Order created');
    return order;
  }
}
```

**Correct (injected dependencies):**

```typescript
interface IDatabase {
  insert(table: string, data: unknown): Promise<unknown>;
}

interface IMailer {
  send(to: string, message: string): Promise<void>;
}

class OrderService {
  constructor(
    private db: IDatabase,
    private mailer: IMailer
  ) {}

  async createOrder(data: OrderData) {
    const order = await this.db.insert('orders', data);
    await this.mailer.send(data.email, 'Order created');
    return order;
  }
}

// Usage
const service = new OrderService(
  new PostgresDatabase(connectionString),
  new SendGridMailer(apiKey)
);

// Testing
const mockDb = { insert: jest.fn() };
const mockMailer = { send: jest.fn() };
const testService = new OrderService(mockDb, mockMailer);
```

**Benefits:**
- Easy mocking for unit tests
- Swappable implementations
- Clear dependencies visible in constructor
- Supports interface-based design

**Tools:** Static analyzer, PR review
