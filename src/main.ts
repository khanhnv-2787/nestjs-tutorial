import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { AppModule } from './app.module';
import type { Env } from './config/env.validation';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Mọi route sẽ có tiền tố /api  ->  @Get() trong AppController = GET /api
  app.setGlobalPrefix('api');

  // PIPE GLOBAL: chạy cho MỌI endpoint, trước khi request tới controller.
  app.useGlobalPipes(
    // I18nValidationPipe KẾ THỪA ValidationPipe -> giữ nguyên mọi option cũ,
    // chỉ khác là ném ra exception mang khoá dịch thay vì chuỗi cứng.
    new I18nValidationPipe({
      // Xoá field không được khai báo (không có decorator) trong DTO.
      // Chống mass-assignment.
      whitelist: true,
      // Thay vì lặng lẽ xoá, trả luôn 400.
      forbidNonWhitelisted: true,
      // Biến plain object thành INSTANCE THẬT của DTO class + ép kiểu param/query.
      transform: true,
    }),
  );

  // Bắt I18nValidationException do pipe trên ném ra, dịch rồi format thành 400.
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({ detailedErrors: false }),
  );

  setupSwagger(app);

  const configService = app.get<ConfigService<Env, true>>(ConfigService);
  await app.listen(configService.get('PORT', { infer: true }));
}
void bootstrap();
