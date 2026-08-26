import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { In, Repository } from 'typeorm';
import { isDuplicateKeyError } from '../../common/database/is-duplicate-key-error';
import { ProfilesService } from '../profiles/profiles.service';
import { User } from '../users/entities/user.entity';
import type { ArticleMeta } from './dto/article-response.dto';
import { CreateArticleBodyDto } from './dto/create-article.dto';
import { UpdateArticleBodyDto } from './dto/update-article.dto';
import { ArticleFavorite } from './entities/article-favorite.entity';
import { Article } from './entities/article.entity';
import { Tag } from './entities/tag.entity';
import { generateSlug } from './slug.util';

/** Article kèm phần thông tin phải tính theo người xem. */
export interface ArticleWithMeta extends ArticleMeta {
  article: Article;
}

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(ArticleFavorite)
    private readonly favoriteRepository: Repository<ArticleFavorite>,
    private readonly profilesService: ProfilesService,
    private readonly i18n: I18nService,
  ) {}

  async createArticle(
    author: User,
    data: CreateArticleBodyDto,
  ): Promise<ArticleWithMeta> {
    const tags = await this.resolveTags(data.tagList ?? []);

    const article = this.articleRepository.create({
      slug: generateSlug(data.title),
      title: data.title,
      description: data.description,
      body: data.body,
      authorId: author.id,
      author,
      tags,
    });

    try {
      const saved = await this.articleRepository.save(article);
      this.logger.log(`Đã tạo article id=${saved.id} slug=${saved.slug}`);

      // Bài vừa tạo: chưa ai thích, và tác giả không tự follow mình.
      return {
        article: saved,
        favorited: false,
        favoritesCount: 0,
        following: false,
      };
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException(this.i18n.t('article.slug_conflict'));
      }
      this.logger.error(
        `Lỗi khi tạo article của user id=${author.id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async findBySlug(slug: string, viewer?: User): Promise<ArticleWithMeta> {
    const article = await this.getBySlugOrFail(slug);
    return { article, ...(await this.buildMeta(article, viewer)) };
  }

  /**
   * Cập nhật bài viết. Chỉ tác giả được phép.
   *
   * Đổi title thì slug được sinh lại — URL cũ sẽ 404. Đây là hành vi của
   * đặc tả RealWorld. Blog thật thường GIỮ NGUYÊN slug sau khi xuất bản để
   * không làm hỏng link đã chia sẻ; nếu muốn vậy thì bỏ dòng sinh slug đi.
   */
  async updateArticle(
    slug: string,
    viewer: User,
    data: UpdateArticleBodyDto,
  ): Promise<ArticleWithMeta> {
    const article = await this.getBySlugOrFail(slug);
    this.assertIsAuthor(article, viewer);

    if (data.title !== undefined && data.title !== article.title) {
      article.title = data.title;
      article.slug = generateSlug(data.title);
    }
    if (data.description !== undefined) article.description = data.description;
    if (data.body !== undefined) article.body = data.body;
    // tagList gửi lên là THAY THẾ toàn bộ, không phải thêm vào.
    // Gán mảng mới rồi save() -> TypeORM tự đồng bộ bảng article_tags:
    // xoá liên kết cũ, thêm liên kết mới.
    if (data.tagList !== undefined) {
      article.tags = await this.resolveTags(data.tagList);
    }

    try {
      const saved = await this.articleRepository.save(article);
      this.logger.log(`Đã cập nhật article id=${saved.id} slug=${saved.slug}`);
      return { article: saved, ...(await this.buildMeta(saved, viewer)) };
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException(this.i18n.t('article.slug_conflict'));
      }
      this.logger.error(
        `Lỗi khi cập nhật article slug=${slug}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /** Xoá bài viết. Chỉ tác giả được phép. */
  async deleteArticle(slug: string, viewer: User): Promise<void> {
    const article = await this.getBySlugOrFail(slug);
    this.assertIsAuthor(article, viewer);

    // delete() theo id thay vì remove(entity): một câu DELETE duy nhất.
    // Các bản ghi ở article_tags và article_favorites tự biến mất nhờ ràng
    // buộc ON DELETE CASCADE khai từ bước 1 — không phải dọn bằng tay.
    await this.articleRepository.delete({ id: article.id });
    this.logger.log(`Đã xoá article id=${article.id} slug=${slug}`);
  }

  private async buildMeta(
    article: Article,
    viewer?: User,
  ): Promise<ArticleMeta> {
    const [favoritesCount, favorited, following] = await Promise.all([
      this.favoriteRepository.countBy({ articleId: article.id }),
      viewer
        ? this.favoriteRepository.existsBy({
            userId: viewer.id,
            articleId: article.id,
          })
        : Promise.resolve(false),
      this.profilesService.isFollowing(viewer, article.author),
    ]);

    return { favorited, favoritesCount, following };
  }

  private async getBySlugOrFail(slug: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { slug },
      relations: { author: true, tags: true },
    });

    if (!article) {
      throw new NotFoundException(this.i18n.t('article.not_found'));
    }
    return article;
  }

  /**
   * Chặn người không phải tác giả.
   *
   * Trả 403 chứ không phải 404: bài viết là công khai (ai cũng GET được),
   * nên giấu sự tồn tại của nó chẳng bảo vệ được gì, mà lại làm client
   * không phân biệt được "không có bài" với "không có quyền".
   *
   * Kiểm ở SERVICE, không phải controller — mọi lối vào tới hành động này
   * đều phải đi qua đây, kể cả sau này có thêm controller khác gọi tới.
   */
  private assertIsAuthor(article: Article, user: User): void {
    if (article.authorId !== user.id) {
      throw new ForbiddenException(this.i18n.t('article.forbidden'));
    }
  }

  private async resolveTags(names: string[]): Promise<Tag[]> {
    const unique = [
      ...new Set(
        names.map((name) => name.trim().toLowerCase()).filter(Boolean),
      ),
    ];
    if (unique.length === 0) return [];

    await this.tagRepository
      .createQueryBuilder()
      .insert()
      .into(Tag)
      .values(unique.map((name) => ({ name })))
      .orIgnore()
      .execute();

    return this.tagRepository.findBy({ name: In(unique) });
  }
}
