import { ApiProperty } from '@nestjs/swagger';
import { ProfileDto } from '../../profiles/dto/profile-response.dto';
import { Article } from '../entities/article.entity';

/**
 * Những thông tin KHÔNG nằm trong bảng articles, phải tính riêng theo
 * người đang xem: đã thích chưa, bao nhiêu lượt thích, có follow tác giả không.
 */
export interface ArticleMeta {
  favorited: boolean;
  favoritesCount: number;
  following: boolean;
}

export class ArticleDto {
  @ApiProperty({ example: 'cach-hoc-nestjs-a1b2c3' })
  slug: string;

  @ApiProperty({ example: 'Cách học NestJS' })
  title: string;

  @ApiProperty({ example: 'Ghi chép quá trình học' })
  description: string;

  @ApiProperty({ example: 'Nội dung bài viết...' })
  body: string;

  @ApiProperty({ type: [String], example: ['nestjs', 'typeorm'] })
  tagList: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ example: false })
  favorited: boolean;

  @ApiProperty({ example: 0 })
  favoritesCount: number;

  @ApiProperty({ type: ProfileDto })
  author: ProfileDto;
}

export class ArticleResponseDto {
  @ApiProperty({ type: ArticleDto })
  article: ArticleDto;
}

/**
 * Danh sách TRẮNG. Chú ý `author` chỉ lấy 4 field của profile — không có
 * email, không có id. Dùng lại đúng hình dạng ProfileDto của PR 3.
 */
export function toArticleResponse(
  article: Article,
  meta: ArticleMeta,
): ArticleResponseDto {
  return {
    article: {
      slug: article.slug,
      title: article.title,
      description: article.description,
      body: article.body,
      // tags có thể chưa được load -> mặc định mảng rỗng thay vì undefined.
      tagList: (article.tags ?? []).map((tag) => tag.name),
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      favorited: meta.favorited,
      favoritesCount: meta.favoritesCount,
      author: {
        username: article.author.username,
        bio: article.author.bio,
        image: article.author.image,
        following: meta.following,
      },
    },
  };
}
