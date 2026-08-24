import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: z.coerce.number().int().positive().max(65535).default(3306),
  DB_USERNAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),
  DEFAULT_LANGUAGE: z.enum(['vi', 'en']).default('vi'),

  // Redis — blacklist token lúc logout (sau này thêm hàng đợi gửi mail).
  REDIS_HOST: z.string().min(1).default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().max(65535).default(6379),
  JWT_SECRET: z.string().min(32),
  // Định dạng timespan của thư viện jsonwebtoken: 60s, 30m, 12h, 7d, 2w, 1y.
  // Có regex để chuỗi sai bị chặn ngay lúc boot, thay vì gây 500 lúc ký token.
  JWT_EXPIRES_IN: z
    .string()
    .regex(/^\d+[smhdwy]$/, 'phải có dạng 60s / 30m / 12h / 7d / 2w / 1y')
    .default('7d'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(`Config env validation failed:\n${details}`);
  }

  return result.data;
}
