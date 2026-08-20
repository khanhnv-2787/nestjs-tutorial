import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import type { Env } from './config/env.validation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Mọi route sẽ có tiền tố /api  ->  @Get() trong AppController = GET /api
  app.setGlobalPrefix('api');

  // PIPE GLOBAL: chạy cho MỌI endpoint, trước khi request tới controller.
  app.useGlobalPipes(
    new ValidationPipe({
      // Xoá field không được khai báo (không có decorator) trong DTO.
      // Client gửi { email, password, role: "admin" } mà DTO không có `role`
      // -> field đó bị loại trước khi tới service. Chống mass-assignment.
      whitelist: true,
      // Thay vì lặng lẽ xoá, trả luôn 400.
      forbidNonWhitelisted: true,
      // Chạy class-transformer: biến plain object thành INSTANCE THẬT của DTO class.
      // Không có nó: `body instanceof CreateUserDto` = false, method trên DTO không tồn tại.
      // Nó cũng cho phép ép kiểu param/query từ string sang number (dùng nhiều ở giai đoạn 6).
      transform: true,
    }),
  );

  const configService = app.get<ConfigService<Env, true>>(ConfigService);
  const port = configService.get('PORT', { infer: true });

  await app.listen(port);
}
void bootstrap();
