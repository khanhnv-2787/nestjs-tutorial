import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { ArticlesService } from '../articles/articles.service';
import { ProfilesService } from '../profiles/profiles.service';
import { User } from '../users/entities/user.entity';
import type { CommentWithFollowing } from './dto/comment-response.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly articlesService: ArticlesService,
    private readonly profilesService: ProfilesService,
    private readonly i18n: I18nService,
  ) {}

  async addComment(
    slug: string,
    author: User,
    body: string,
  ): Promise<CommentWithFollowing> {
    const articleId = await this.articlesService.getArticleIdBySlug(slug);

    // Gán thẳng `author` (đã có sẵn từ @CurrentUser()) thay vì để TypeORM
    // tự nạp lại từ DB — response cần author.username/bio/image ngay sau khi
    // save() mà không tốn thêm truy vấn.
    const comment = this.commentRepository.create({
      articleId,
      authorId: author.id,
      author,
      body,
    });
    const saved = await this.commentRepository.save(comment);

    this.logger.log(
      `User id=${author.id} da binh luan article id=${articleId}`,
    );

    // Tự bình luận bài của mình vẫn hợp lệ, nhưng follow chính mình thì
    // ProfilesService.isFollowing luôn trả false — nhất quán, khỏi cần hỏi.
    return { comment: saved, following: false };
  }

  async listComments(
    slug: string,
    viewer?: User,
  ): Promise<CommentWithFollowing[]> {
    const articleId = await this.articlesService.getArticleIdBySlug(slug);

    const comments = await this.commentRepository.find({
      where: { articleId },
      relations: { author: true },
      // Cũ nhất trước: đọc bình luận theo đúng thứ tự viết, giống một luồng
      // thảo luận thật — khác articles (mới nhất trước, để lướt tin mới).
      order: { createdAt: 'ASC' },
    });
    if (comments.length === 0) return [];

    // 1 query duy nhất cho cả trang, cùng kỹ thuật buildMetaMany của articles:
    // gọi isFollowing trong vòng lặp sẽ là N+1.
    const authorIds = [...new Set(comments.map((comment) => comment.authorId))];
    const followedIds = await this.profilesService.filterFollowedIds(
      viewer,
      authorIds,
    );

    return comments.map((comment) => ({
      comment,
      following: followedIds.has(comment.authorId),
    }));
  }

  /** Xoá bình luận. Chỉ tác giả CỦA BÌNH LUẬN được phép — không phải tác giả bài viết. */
  async deleteComment(
    slug: string,
    commentId: number,
    viewer: User,
  ): Promise<void> {
    const articleId = await this.articlesService.getArticleIdBySlug(slug);

    // Lọc thêm articleId trong WHERE: bình luận đúng id nhưng thuộc bài khác
    // phải báo "không tìm thấy", không phải xoá nhầm hoặc lộ thông tin.
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, articleId },
    });
    if (!comment) {
      throw new NotFoundException(this.i18n.t('comment.not_found'));
    }
    if (comment.authorId !== viewer.id) {
      throw new ForbiddenException(this.i18n.t('comment.forbidden'));
    }

    await this.commentRepository.delete({ id: comment.id });
    this.logger.log(
      `Da xoa comment id=${comment.id} cua article id=${articleId}`,
    );
  }
}
