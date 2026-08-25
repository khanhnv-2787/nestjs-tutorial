import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { memoryStorage } from 'multer';
import type { Env } from '../../config/env.validation';
import { BadRequestException } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { AttachmentsModule } from '../attachments/attachments.module';
import { isAllowedImageMime } from '../attachments/attachment.constants';
import { TokenModule } from '../token/token.module';
import { CurrentUserController } from './current-user.controller';
import { UserFollow } from './entities/user-follow.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  // Thêm UserFollow để autoLoadEntities biết tới nó.
  // Không khai ở đây thì app chạy vẫn không "thấy" bảng user_follows.
  imports: [
    TypeOrmModule.forFeature([User, UserFollow]),
    // Cần để thu hồi token hiện tại khi user đổi mật khẩu.
    TokenModule,
    AttachmentsModule,
    // registerAsync để lấy giới hạn dung lượng từ ConfigService.
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        // memoryStorage: file nằm trong RAM dưới dạng Buffer, service tự
        // quyết định ghi đi đâu và với tên gì. Nếu để multer ghi thẳng
        // xuống đĩa thì file rác vẫn nằm lại khi validation thất bại.
        storage: memoryStorage(),
        limits: {
          // Chặn ngay ở tầng parse — không đọc hết vào RAM rồi mới từ chối.
          fileSize:
            config.get('MAX_UPLOAD_SIZE_MB', { infer: true }) * 1024 * 1024,
          files: 1,
        },
        // fileFilter chạy TRƯỚC khi multer nạp nội dung file vào buffer.
        // Nhờ vậy file sai định dạng bị loại mà không tốn RAM.
        // I18nContext.current() lấy được ngôn ngữ vì middleware của
        // nestjs-i18n đã chạy trước bộ parse body.
        fileFilter: (_req, file, callback) => {
          if (!isAllowedImageMime(file.mimetype)) {
            callback(
              new BadRequestException(
                I18nContext.current()?.t('attachment.invalid_type') ??
                  'Invalid file type',
              ),
              false,
            );
            return;
          }
          callback(null, true);
        },
      }),
    }),
  ],
  controllers: [UsersController, CurrentUserController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
