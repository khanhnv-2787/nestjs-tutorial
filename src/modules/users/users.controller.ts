import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { toUserResponse, type UserResponse } from './dto/user-response.dto';
import { UsersService } from './users.service';

// Tiền tố 'users' khai ở đây -> mọi route bên trong đều bắt đầu bằng /api/users
// ('/api' là global prefix đặt ở main.ts).
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST /api/users
  @Post()
  async signUp(@Body() dto: CreateUserDto): Promise<UserResponse> {
    // dto đã được ValidationPipe global kiểm tra xong xuôi trước khi tới đây.
    // Controller chỉ điều phối: nhận -> gọi service -> map ra response.
    const user = await this.usersService.createUser(dto.user);
    return toUserResponse(user);
  }

  // GET /api/users/:id
  // TẠM THỜI — giai đoạn 3 sẽ thay bằng GET /api/user dùng JWT.
  @Get(':id')
  async findOne(
    // ParseIntPipe: chuyển "5" thành số 5, và trả 400 nếu không phải số.
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponse> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(`Không tìm thấy user id ${id}`);
    }
    return toUserResponse(user);
  }
}
