import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/** Tên tham chiếu của bearer scheme, dùng lại trong @ApiBearerAuth(BEARER_AUTH_NAME). */
export const BEARER_AUTH_NAME = 'access-token';

/** Đường dẫn trang docs. KHÔNG chịu ảnh hưởng của setGlobalPrefix nên phải ghi đủ. */
const SWAGGER_PATH = 'api/docs';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Conduit API')
    .setDescription('RealWorld API — NestJS + MySQL')
    .setVersion('1.0')
    // Khai sẵn cơ chế bearer token để PR 2 (JWT) có chỗ gắn vào.
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      BEARER_AUTH_NAME,
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    // Giữ lại token đã nhập khi reload trang — rất tiện từ PR 2 trở đi.
    swaggerOptions: { persistAuthorization: true },
  });
}
