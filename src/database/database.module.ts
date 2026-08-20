import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { Env } from '../config/env.validation';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      // Khai cần provider nào; Nest resolve xong mới gọi useFactory
      // với đúng thứ tự tham số này.
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): TypeOrmModuleOptions => {
        // Lấy giá trị ra biến trước: mỗi biến được suy kiểu từ Env (string/number),
        // không bị kiểu của TypeOrmModuleOptions ép ngược vào.
        const host = config.get('DB_HOST', { infer: true });
        const port = config.get('DB_PORT', { infer: true });
        const username = config.get('DB_USERNAME', { infer: true });
        const password = config.get('DB_PASSWORD', { infer: true });
        const database = config.get('DB_NAME', { infer: true });
        const isDev = config.get('NODE_ENV', { infer: true }) === 'development';

        return {
          type: 'mysql',
          host,
          port,
          username,
          password,
          database,

          // Tự nạp entity nào được đăng ký qua TypeOrmModule.forFeature()
          // ở module con (UsersModule sẽ dùng ở giai đoạn 2).
          autoLoadEntities: true,

          // TUYỆT ĐỐI để false — schema chỉ được đổi qua migration.
          synchronize: false,

          // In SQL ra console khi dev.
          logging: isDev,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
