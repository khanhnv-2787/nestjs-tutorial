import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tag } from './tag.entity';

@Entity('articles')
// Danh sách bài mặc định sắp theo createdAt giảm dần -> có index thì MySQL
// không phải sắp xếp lại toàn bảng mỗi lần truy vấn.
@Index(['createdAt'])
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Định danh trong URL, sinh từ title.
   *
   * Client gọi /api/articles/:slug chứ không phải /:id — URL đọc được, và
   * không lộ số lượng bài đã có trong hệ thống.
   */
  @Column({ unique: true, length: 255 })
  slug: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'text' })
  body: string;

  @Column()
  authorId: number;

  // Xoá user thì mọi bài viết của họ biến mất theo.
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  /**
   * ManyToMany: một bài nhiều tag, một tag nhiều bài.
   *
   * @JoinTable khai ở PHÍA NÀY nghĩa là Article là bên "sở hữu" quan hệ —
   * TypeORM tự tạo bảng nối article_tags, không cần entity riêng vì bảng đó
   * chỉ có hai cột khoá, không mang dữ liệu gì thêm.
   *
   * Khác với article_favorites: bảng đó có thêm createdAt nên phải khai
   * thành entity mới truy cập được.
   */
  @ManyToMany(() => Tag, { cascade: ['insert'] })
  @JoinTable({
    name: 'article_tags',
    joinColumn: { name: 'articleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
