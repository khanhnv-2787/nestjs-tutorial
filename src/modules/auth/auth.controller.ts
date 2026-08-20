import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  toUserResponse,
  type UserResponseDto,
} from '../users/dto/user-response.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /api/auth/login
  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiUnauthorizedResponse({ description: 'Email hoặc mật khẩu không đúng' })
  // Mặc định @Post trả 201 Created. Login không tạo tài nguyên nào nên 200 đúng hơn.
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<UserResponseDto> {
    const { user, token } = await this.authService.login(dto.user);
    return toUserResponse(user, token);
  }
}
