import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesModule } from '../articles/articles.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    // ArticlesService để xác nhận bài viết tồn tại (getArticleIdBySlug).
    ArticlesModule,
    // ProfilesService để tính field `following` của tác giả bình luận.
    ProfilesModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
