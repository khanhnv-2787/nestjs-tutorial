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
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { toUserResponse, type UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

// @ApiTags gom nhóm endpoint trong trang docs. Khai tường minh chữ thường
// cho khớp đường dẫn — không khai thì plugin tự suy ra "Users" viết hoa.
@ApiTags('users')
// Tiền tố 'users' khai ở đây -> mọi route bên trong đều bắt đầu bằng /api/users
// ('/api' là global prefix đặt ở main.ts).
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST /api/users
  //
  // Chỉ khai những gì plugin KHÔNG suy ra được: mô tả bằng lời và các mã lỗi
  // ném ra từ tầng service. Còn body và response 201 thì plugin tự đọc từ
  // kiểu tham số + kiểu trả về.
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiConflictResponse({ description: 'Email hoặc username đã tồn tại' })
  @ApiBadRequestResponse({ description: 'Dữ liệu gửi lên không hợp lệ' })
  @Post()
  async signUp(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    // dto đã được ValidationPipe global kiểm tra xong xuôi trước khi tới đây.
    // Controller chỉ điều phối: nhận -> gọi service -> map ra response.
    const user = await this.usersService.createUser(dto.user);
    return toUserResponse(user);
  }

  // GET /api/users/:id
  // TẠM THỜI — PR 2 sẽ thay bằng GET /api/user dùng JWT.
  @ApiOperation({
    summary: '[Tạm thời] Lấy user theo id',
    description: 'Sẽ được thay bằng `GET /api/user` (dùng JWT) ở PR 2.',
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy user' })
  @ApiBadRequestResponse({ description: 'id không phải số' })
  @Get(':id')
  async findOne(
    // ParseIntPipe: chuyển "5" thành số 5, và trả 400 nếu không phải số.
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(`Không tìm thấy user id ${id}`);
    }
    return toUserResponse(user);
  }
}
