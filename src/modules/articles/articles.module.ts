import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesModule } from '../profiles/profiles.module';
import { ArticlesController } from './articles.controller';
import { TagsController } from './tags.controller';
import { ArticlesService } from './articles.service';
import { ArticleFavorite } from './entities/article-favorite.entity';
import { Article } from './entities/article.entity';
import { Tag } from './entities/tag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Tag, ArticleFavorite]),
    // ProfilesService để tính field `following` của tác giả (dùng từ bước 3).
    ProfilesModule,
  ],
  controllers: [ArticlesController, TagsController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
