---
title: No Business Logic In Constructors
impact: HIGH
impactDescription: ensures predictable object initialization
tags: constructor, initialization, side-effects, patterns, quality
---

## No Business Logic In Constructors

Constructors should only initialize state. Side effects in constructors are unexpected and make testing difficult.

**Incorrect (logic in constructor):**

```typescript
class UserService {
  private config: Config;
  
  constructor(configPath: string) {
    // BAD: Reading files in constructor
    const rawConfig = fs.readFileSync(configPath);
    this.config = JSON.parse(rawConfig);
    
    // BAD: API calls in constructor
    const response = await fetch('/api/init');
    
    // BAD: Logging/side effects
    logger.info('UserService initialized');
  }
}
```

**Correct (factory method pattern):**

```typescript
class UserService {
  constructor(
    private readonly config: Config,
    private readonly httpClient: HttpClient
  ) {
    // Only assignment - no side effects
  }

  // Factory method for complex initialization
  static async create(configPath: string): Promise<UserService> {
    const rawConfig = await fs.readFile(configPath);
    const config = JSON.parse(rawConfig);
    
    const httpClient = new HttpClient(config.baseUrl);
    await httpClient.initialize();
    
    logger.info('UserService initialized');
    return new UserService(config, httpClient);
  }
}

// Usage
const service = await UserService.create('./config.json');
```

**Tools:** Static analyzer, Manual review
