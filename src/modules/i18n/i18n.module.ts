import * as path from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule as NestI18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import type { Env } from '../../config/env.validation';

@Module({
  imports: [
    NestI18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        fallbackLanguage: config.get('DEFAULT_LANGUAGE', { infer: true }),
        loaderOptions: {
          path: path.join(__dirname, '../../i18n'),
          watch: true,
        },
      }),
      resolvers: [
        new QueryResolver(['lang']),
        new HeaderResolver(['x-lang']),
        AcceptLanguageResolver,
      ],
    }),
  ],
})
export class I18nModule {}
