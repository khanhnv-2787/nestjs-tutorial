import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserDto {
  @ApiProperty({ example: 'khanh@test.com' })
  email: string;

  @ApiProperty({ example: 'khanh' })
  username: string;

  @ApiProperty({ example: null, nullable: true, type: String })
  bio: string | null;

  @ApiProperty({ example: null, nullable: true, type: String })
  image: string | null;

  // Chỉ có ở login (và register nếu bạn muốn) — các endpoint khác không trả token.
  @ApiProperty({
    required: false,
    description: 'JWT, chỉ xuất hiện ở endpoint đăng nhập',
  })
  token?: string;
}

export class UserResponseDto {
  @ApiProperty({ type: UserDto })
  user: UserDto;
}

// Danh sách TRẮNG: chỉ field liệt kê ở đây mới ra ngoài.
// token là tham số tuỳ chọn -> lời gọi cũ toUserResponse(user) ở signup
// vẫn chạy nguyên, không phải sửa.
export function toUserResponse(user: User, token?: string): UserResponseDto {
  return {
    user: {
      email: user.email,
      username: user.username,
      bio: user.bio,
      image: user.image,
      ...(token ? { token } : {}),
    },
  };
}
