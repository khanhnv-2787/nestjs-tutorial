import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesModule } from '../profiles/profiles.module';
import { ArticleFavorite } from './entities/article-favorite.entity';
import { Article } from './entities/article.entity';
import { Tag } from './entities/tag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Tag, ArticleFavorite]),
    // ProfilesService để tính field `following` của tác giả trong response.
    // Đã export sẵn từ PR 3.
    ProfilesModule,
  ],
  // Controller và provider sẽ thêm dần từ bước 2.
  controllers: [],
  providers: [],
})
export class ArticlesModule {}
