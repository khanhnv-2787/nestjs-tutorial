import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { TokenPayload } from '../../common/decorators/token-payload.decorator';
import { BEARER_AUTH_NAME } from '../../config/swagger.config';
import {
  toUserResponse,
  type UserResponseDto,
} from '../users/dto/user-response.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './strategies/jwt.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /api/auth/login
  // Phải @Public: chưa đăng nhập thì làm gì có token để mà xác thực.
  @Public()
  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiUnauthorizedResponse({ description: 'Email hoặc mật khẩu không đúng' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<UserResponseDto> {
    const { user, token } = await this.authService.login(dto.user);
    return toUserResponse(user, token);
  }

  // POST /api/auth/logout
  // KHÔNG @Public: phải có token hợp lệ mới logout được — chính token đó
  // là thứ sẽ bị thu hồi.
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Đăng xuất — thu hồi token hiện tại' })
  @ApiNoContentResponse({ description: 'Đã đăng xuất' })
  @ApiUnauthorizedResponse({
    description: 'Thiếu token hoặc token không hợp lệ',
  })
  // 204: thành công nhưng không có gì để trả về.
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@TokenPayload() payload: JwtPayload): Promise<void> {
    await this.authService.logout(payload);
  }
}
