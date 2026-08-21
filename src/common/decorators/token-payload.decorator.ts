import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Lấy payload đã được xác minh của token hiện tại.
 *
 * Khác @CurrentUser() ở chỗ: @CurrentUser trả về entity User (lấy từ DB),
 * còn cái này trả về nội dung token (jti, exp...) — thứ cần để thu hồi.
 *
 * Giá trị do JwtStrategy.validate() gán vào request.jwtPayload.
 */
export const TokenPayload = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): unknown => {
    const request = ctx.switchToHttp().getRequest<{ jwtPayload?: unknown }>();
    return request.jwtPayload;
  },
);
