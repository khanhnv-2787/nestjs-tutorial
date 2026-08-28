import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Article } from '../../articles/entities/article.entity';
import { User } from '../../users/entities/user.entity';

@Entity('comments')
// Lấy toàn bộ bình luận của một bài -> lọc theo articleId là truy vấn chính.
@Index(['articleId'])
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  body: string;

  @Column()
  articleId: number;

  // Xoá bài viết thì mọi bình luận của nó biến mất theo.
  @ManyToOne(() => Article, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'articleId' })
  article: Article;

  @Column()
  authorId: number;

  // Xoá user thì mọi bình luận họ đã viết biến mất theo.
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
