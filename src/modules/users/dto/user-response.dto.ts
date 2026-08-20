import { User } from '../entities/user.entity';

export interface UserResponse {
  user: {
    email: string;
    username: string;
    bio: string | null;
    image: string | null;
  };
}

// Danh sách TRẮNG: chỉ những field liệt kê ở đây mới ra ngoài.
// Thêm cột mới vào entity sẽ KHÔNG tự động lộ ra API.
export function toUserResponse(user: User): UserResponse {
  return {
    user: {
      email: user.email,
      username: user.username,
      bio: user.bio,
      image: user.image,
    },
  };
}
