import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Lấy user đang đăng nhập ra làm tham số của handler.
 *
 * Chuỗi sự kiện dẫn tới đây:
 *   1. JwtAuthGuard xác minh token
 *   2. JwtStrategy.validate() truy vấn DB, trả về User
 *   3. Passport gán giá trị đó vào request.user
 *   4. Decorator này đọc request.user ra
 *
 * Cố ý KHÔNG import entity User: thư mục common/ không được phụ thuộc vào
 * modules/. Kiểu dữ liệu để controller tự khai: @CurrentUser() user: User
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): unknown => {
    const request = ctx.switchToHttp().getRequest<{ user?: unknown }>();
    return request.user;
  },
);
