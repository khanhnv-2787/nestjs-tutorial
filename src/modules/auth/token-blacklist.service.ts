import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.module';

@Injectable()
export class TokenBlacklistService {
  private readonly logger = new Logger(TokenBlacklistService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  /** Tiền tố `bl:jti:` để không lẫn với dữ liệu khác dùng chung Redis. */
  private key(jti: string): string {
    return `bl:jti:${jti}`;
  }

  /**
   * Thu hồi một token.
   *
   * @param jti định danh token (claim `jti` trong payload)
   * @param expiresAt thời điểm token hết hạn (claim `exp`, đơn vị GIÂY)
   */
  async revoke(jti: string, expiresAt: number): Promise<void> {
    // TTL = thời gian còn lại của token. Đây là điểm cốt lõi của thiết kế:
    // token hết hạn thì bản ghi blacklist TỰ biến mất -> không cần job dọn,
    // và blacklist không bao giờ phình to vô hạn.
    const ttlSeconds = expiresAt - Math.floor(Date.now() / 1000);

    // Token đã hết hạn thì bản thân JWT không còn hợp lệ -> lưu làm gì.
    if (ttlSeconds <= 0) return;

    // SET key value EX ttl  — 'EX' tính bằng giây.
    await this.redis.set(this.key(jti), '1', 'EX', ttlSeconds);
    this.logger.log(`Đã thu hồi token jti=${jti}, còn ${ttlSeconds}s`);
  }

  async isRevoked(jti: string): Promise<boolean> {
    // EXISTS trả về 1 hoặc 0, không phải boolean.
    return (await this.redis.exists(this.key(jti))) === 1;
  }
}
