import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BEARER_AUTH_NAME } from '../../config/swagger.config';
import { toUserResponse, type UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';

@ApiTags('user')
// Tiền tố SỐ ÍT 'user' — tài nguyên "người đang đăng nhập".
// Khác 'users' (số nhiều) là tập hợp mọi user.
// PR 3 sẽ thêm PUT /api/user (update profile) vào đúng controller này.
@Controller('user')
export class CurrentUserController {
  // Không inject service nào: JwtStrategy.validate() đã nạp User vào request.

  // GET /api/user
  // KHÔNG có @Public() -> JwtAuthGuard toàn cục tự bảo vệ.
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Lấy thông tin user đang đăng nhập' })
  @ApiUnauthorizedResponse({
    description: 'Thiếu token hoặc token không hợp lệ',
  })
  @Get()
  getCurrentUser(@CurrentUser() user: User): UserResponseDto {
    return toUserResponse(user);
  }
}
