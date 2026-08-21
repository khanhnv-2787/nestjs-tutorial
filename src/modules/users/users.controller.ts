import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { toUserResponse, type UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST /api/users
  // Phải @Public: người chưa có tài khoản thì chưa thể có token.
  @Public()
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiConflictResponse({ description: 'Email hoặc username đã tồn tại' })
  @ApiBadRequestResponse({ description: 'Dữ liệu gửi lên không hợp lệ' })
  @Post()
  async signUp(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.createUser(dto.user);
    return toUserResponse(user);
  }
}
