import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export class ProfileDto {
  @ApiProperty({ example: 'khanh' })
  username: string;

  @ApiProperty({ example: null, nullable: true, type: String })
  bio: string | null;

  @ApiProperty({ example: null, nullable: true, type: String })
  image: string | null;

  @ApiProperty({
    example: false,
    description:
      'User đang đăng nhập có follow người này không. Khách chưa đăng nhập luôn nhận false.',
  })
  following: boolean;
}

export class ProfileResponseDto {
  @ApiProperty({ type: ProfileDto })
  profile: ProfileDto;
}

/**
 * Danh sách TRẮNG, giống toUserResponse nhưng KHÔNG có `email`.
 * Profile là thứ người lạ xem được — email là thông tin riêng, không lộ.
 */
export function toProfileResponse(
  user: User,
  following: boolean,
): ProfileResponseDto {
  return {
    profile: {
      username: user.username,
      bio: user.bio,
      image: user.image,
      following,
    },
  };
}
