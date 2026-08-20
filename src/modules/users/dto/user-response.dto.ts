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
}

export class UserResponseDto {
  @ApiProperty({ type: UserDto })
  user: UserDto;
}

// Danh sách TRẮNG: chỉ field liệt kê ở đây mới ra ngoài.
export function toUserResponse(user: User): UserResponseDto {
  return {
    user: {
      email: user.email,
      username: user.username,
      bio: user.bio,
      image: user.image,
    },
  };
}
