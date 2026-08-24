import { Module } from '@nestjs/common';
import { TokenBlacklistService } from './token-blacklist.service';

/**
 * Module hạ tầng cho việc thu hồi token.
 *
 * Tách riêng khỏi AuthModule để UsersModule dùng được mà không tạo phụ
 * thuộc vòng (AuthModule đã import UsersModule).
 *
 * Chỉ cần REDIS_CLIENT — do RedisModule global cung cấp nên không phải
 * khai gì trong imports.
 */
@Module({
  providers: [TokenBlacklistService],
  exports: [TokenBlacklistService],
})
export class TokenModule {}
