import * as path from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule as NestI18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import type { Env } from '../config/env.validation';

/**
 * Gói cấu hình đa ngôn ngữ.
 *
 * Đặt tên I18nConfigModule (không phải I18nModule) để không trùng với class
 * cùng tên của thư viện nestjs-i18n — thư viện đó được import với bí danh
 * NestI18nModule ngay bên dưới.
 *
 * NestI18nModule là @Global nên I18nService inject được ở mọi module mà
 * không cần khai lại trong imports.
 */
@Module({
  imports: [
    NestI18nModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        fallbackLanguage: config.get('DEFAULT_LANGUAGE', { infer: true }),
        loaderOptions: {
          // __dirname trỏ vào dist/i18n lúc chạy — chính là nơi `assets`
          // trong nest-cli.json copy các file .json tới.
          path: path.join(__dirname, '/'),
          watch: true,
        },
      }),
      // Thứ tự QUAN TRỌNG: resolver nào tìm ra ngôn ngữ trước thì thắng.
      resolvers: [
        new QueryResolver(['lang']), // ?lang=en  — tiện nhất khi test
        new HeaderResolver(['x-lang']), // header x-lang: en
        AcceptLanguageResolver, // header chuẩn của trình duyệt
      ],
    }),
  ],
})
export class I18nConfigModule {}
