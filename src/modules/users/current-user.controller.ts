import { Body, Controller, Get, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TokenPayload } from '../../common/decorators/token-payload.decorator';
import { BEARER_AUTH_NAME } from '../../config/swagger.config';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { UpdateUserDto } from './dto/update-user.dto';
import { toUserResponse, type UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('user')
@Controller('user')
export class CurrentUserController {
  constructor(private readonly usersService: UsersService) {}

  // GET /api/user
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Lấy thông tin user đang đăng nhập' })
  @ApiUnauthorizedResponse({
    description: 'Thiếu token hoặc token không hợp lệ',
  })
  @Get()
  getCurrentUser(@CurrentUser() user: User): UserResponseDto {
    return toUserResponse(user);
  }

  // PUT /api/user
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({
    summary: 'Cập nhật thông tin user đang đăng nhập',
    description:
      'Nếu đổi mật khẩu, token hiện tại bị thu hồi — phải đăng nhập lại.',
  })
  @ApiConflictResponse({ description: 'Email hoặc username đã có người dùng' })
  @ApiUnauthorizedResponse({
    description: 'Thiếu token hoặc token không hợp lệ',
  })
  @Put()
  async updateCurrentUser(
    @CurrentUser() user: User,
    @TokenPayload() payload: JwtPayload,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const updated = await this.usersService.updateUser(user, dto.user, payload);
    return toUserResponse(updated);
  }
}
