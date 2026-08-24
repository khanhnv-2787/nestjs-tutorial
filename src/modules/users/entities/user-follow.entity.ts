import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';

/**
 * Bảng nối quan hệ follow giữa hai user.
 *
 * Dùng KHOÁ CHÍNH GHÉP (followerId, followingId) thay vì cột id tự tăng:
 *   - cặp (A follow B) vốn dĩ đã là duy nhất -> không cần id nhân tạo
 *   - khoá chính ghép tự chặn việc follow trùng ở tầng DB
 *   - bảng nhẹ hơn, không có index thừa
 */
@Entity('user_follows')
// Index cho chiều ngược lại: "ai đang follow user này" (đếm follower).
// Khoá chính đã lo chiều (followerId, ...) rồi nên chỉ cần thêm chiều này.
@Index(['followingId'])
export class UserFollow {
  /** Người bấm nút follow. */
  @PrimaryColumn()
  followerId: number;

  /** Người bị follow. */
  @PrimaryColumn()
  followingId: number;

  // onDelete: 'CASCADE' -> xoá user thì mọi quan hệ follow của họ tự biến mất.
  // Ràng buộc này nằm ở DB, không phụ thuộc vào việc code có nhớ dọn hay không.
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followerId' })
  follower: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followingId' })
  following: User;

  @CreateDateColumn()
  createdAt: Date;
}
