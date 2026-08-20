import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { BEARER_AUTH_NAME } from '../../config/swagger.config';
import { Public } from '../../common/decorators/public.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { toUserResponse, type UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {}

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

  // GET /api/users/:id
  // KHÔNG @Public -> từ giờ route này cần token. Đây cũng là cách dễ nhất
  // để kiểm chứng guard đang hoạt động.
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({
    summary: '[Tạm thời] Lấy user theo id',
    description: 'Sẽ được thay bằng `GET /api/user` (dùng JWT) ở PR 2.',
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy user' })
  @ApiBadRequestResponse({ description: 'id không phải số' })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(
        this.i18n.t('user.not_found', { args: { id } }),
      );
    }
    return toUserResponse(user);
  }
}
