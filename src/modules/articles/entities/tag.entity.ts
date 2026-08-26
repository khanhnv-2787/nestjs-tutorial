import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Tag dùng chung cho mọi article.
 *
 * Tách thành bảng riêng thay vì lưu chuỗi "a,b,c" trong articles:
 *   - GET /api/tags liệt kê được toàn bộ tag mà không phải quét hết bài
 *   - lọc theo tag dùng được index, không phải LIKE '%tag%'
 *   - đổi tên một tag chỉ sửa một dòng
 */
@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  // unique -> hai bài cùng gắn "nestjs" sẽ trỏ vào CÙNG một bản ghi tag.
  @Column({ unique: true, length: 50 })
  name: string;
}
