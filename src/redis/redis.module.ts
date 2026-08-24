import {
  Global,
  Inject,
  Module,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type { Env } from '../config/env.validation';

/** Token DI cho Redis client. Dùng chuỗi vì Redis là class của thư viện ngoài. */
export const REDIS_CLIENT = 'REDIS_CLIENT';

/**
 * @Global() để mọi module inject được REDIS_CLIENT mà không phải import lại,
 * giống cách ConfigModule và I18nModule đang làm.
 */
@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      // useFactory: pattern thứ TƯ bạn gặp, sau TypeOrm/I18n/Jwt.
      useFactory: (config: ConfigService<Env, true>) =>
        new Redis({
          host: config.get('REDIS_HOST', { infer: true }),
          port: config.get('REDIS_PORT', { infer: true }),
        }),
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  /**
   * Đóng kết nối khi app tắt. Không có hàm này thì tiến trình node
   * không chịu thoát vì socket Redis vẫn mở.
   */
  async onApplicationShutdown(): Promise<void> {
    await this.redis.quit();
  }
}
