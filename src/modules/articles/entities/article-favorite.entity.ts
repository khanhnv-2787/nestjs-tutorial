import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Article } from './article.entity';

/**
 * Bảng nối "user thích bài viết".
 *
 * Cùng khuôn với user_follows: khoá chính ghép, không có cột id thừa, và tự
 * chặn favorite trùng ở tầng DB.
 */
@Entity('article_favorites')
// Index chiều ngược: đếm "bài này có bao nhiêu lượt thích".
@Index(['articleId'])
export class ArticleFavorite {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  articleId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Article, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'articleId' })
  article: Article;

  @CreateDateColumn()
  createdAt: Date;
}
