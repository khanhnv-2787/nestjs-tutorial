import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Loại đối tượng mà file đính kèm thuộc về.
 *
 * Thiết kế POLYMORPHIC: một bảng attachments phục vụ mọi loại đối tượng,
 * thay vì mỗi loại một bảng riêng (user_avatars, article_images...).
 * PR sau thêm ảnh cho article chỉ cần thêm một giá trị vào đây.
 */
export const ATTACHABLE_TYPE = {
  USER: 'user',
} as const;

export type AttachableType =
  (typeof ATTACHABLE_TYPE)[keyof typeof ATTACHABLE_TYPE];

@Entity('attachments')
// Index ghép để truy vấn "mọi file của đối tượng X" chạy nhanh.
@Index(['attachableType', 'attachableId'])
export class Attachment {
  /**
   * UUID chứ không phải số tự tăng.
   *
   * Id nằm trong URL tải file, mà id tuần tự thì người ngoài đoán được
   * /attachments/1, /2, /3... và quét sạch. UUID không đoán được.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Thuộc loại đối tượng nào — 'user', sau này thêm 'article'... */
  @Column({ type: 'varchar', length: 50 })
  attachableType: AttachableType;

  /** Id của đối tượng đó. Cố ý KHÔNG có khoá ngoại: */
  // một cột không thể trỏ tới nhiều bảng khác nhau. Đây là đánh đổi
  // cố hữu của thiết kế polymorphic — được linh hoạt, mất ràng buộc DB.
  @Column({ type: 'int' })
  attachableId: number;

  /** Đường dẫn tương đối trong UPLOAD_DIR, ví dụ '2026/08/<uuid>.png'. */
  @Column({ type: 'varchar', length: 500 })
  path: string;

  /** Tên file gốc người dùng tải lên, dùng khi trả file về. */
  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  /** MIME type, ví dụ 'image/png'. Dùng cho header Content-Type. */
  @Column({ type: 'varchar', length: 100 })
  fileType: string;

  /** Kích thước tính bằng byte. */
  @Column({ type: 'int' })
  fileSize: number;

  @CreateDateColumn()
  createdAt: Date;
}
