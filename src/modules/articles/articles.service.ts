import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { In, Repository, type SelectQueryBuilder } from 'typeorm';
import { isDuplicateKeyError } from '../../common/database/is-duplicate-key-error';
import { ProfilesService } from '../profiles/profiles.service';
import { User } from '../users/entities/user.entity';
import type { ArticleMeta } from './dto/article-response.dto';
import { CreateArticleBodyDto } from './dto/create-article.dto';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto';
import { UpdateArticleBodyDto } from './dto/update-article.dto';
import { ArticleFavorite } from './entities/article-favorite.entity';
import { Article } from './entities/article.entity';
import { Tag } from './entities/tag.entity';
import { generateSlug } from './slug.util';

/** Article kèm phần thông tin phải tính theo người xem. */
export interface ArticleWithMeta extends ArticleMeta {
  article: Article;
}

/** Kết quả một trang danh sách. */
export interface ArticleListResult {
  items: { article: Article; meta: ArticleMeta }[];
  articlesCount: number;
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

  /**
   * Danh sách bài viết có lọc và phân trang.
   *
   * Ba bộ lọc (tag / author / favorited) đều tuỳ chọn và KẾT HỢP được với
   * nhau — đây là lý do phải dùng QueryBuilder thay vì find(): câu truy vấn
   * được dựng dần tuỳ theo tham số nào có mặt.
   */
  async listArticles(
    query: ListArticlesQueryDto,
    viewer?: User,
  ): Promise<ArticleListResult> {
    const qb = this.articleRepository
      .createQueryBuilder('article')
      // leftJoinAndSelect: nạp author và tags TRONG CÙNG câu truy vấn.
      // Không có nó thì mỗi bài sẽ tốn thêm query để lấy author/tags -> N+1.
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.tags', 'tag')
      .orderBy('article.createdAt', 'DESC')
      // take/skip (không phải limit/offset): với quan hệ ToMany, TypeORM
      // phải phân trang theo SỐ BÀI chứ không phải số dòng sau khi join —
      // một bài 3 tag sinh ra 3 dòng. take/skip xử lý đúng việc đó.
      .take(query.limit)
      .skip(query.offset);

    this.applyFilters(qb, query);

    const [articles, articlesCount] = await qb.getManyAndCount();
    const metaMap = await this.buildMetaMany(articles, viewer);

    return {
      items: articles.map((article) => ({
        article,
        meta: metaMap.get(article.id) ?? {
          favorited: false,
          favoritesCount: 0,
          following: false,
        },
      })),
      articlesCount,
    };
  }

  /**
   * Gắn các điều kiện lọc vào query.
   *
   * Dùng EXISTS thay vì join thêm: nếu join bảng tags để LỌC, câu join đó
   * sẽ trùng với join dùng để HIỂN THỊ, và bài viết chỉ còn lại đúng tag
   * khớp bộ lọc — mất các tag khác. EXISTS lọc mà không đụng tới dữ liệu
   * được select.
   */
  private applyFilters(
    qb: SelectQueryBuilder<Article>,
    query: ListArticlesQueryDto,
  ): void {
    if (query.tag) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM article_tags at_f
          JOIN tags t_f ON t_f.id = at_f.tagId
          WHERE at_f.articleId = article.id AND t_f.name = :tag
        )`,
        { tag: query.tag.trim().toLowerCase() },
      );
    }

    if (query.author) {
      qb.andWhere('author.username = :author', { author: query.author });
    }

    if (query.favorited) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM article_favorites af_f
          JOIN users u_f ON u_f.id = af_f.userId
          WHERE af_f.articleId = article.id AND u_f.username = :favorited
        )`,
        { favorited: query.favorited },
      );
    }
  }

  /**
   * Tính meta cho NHIỀU bài bằng đúng 3 truy vấn, bất kể danh sách dài bao nhiêu.
   *
   * Gọi buildMeta trong vòng lặp sẽ là 3 x N query — với 20 bài là 60 query
   * cho một request. Đây chính là N+1 mà mentor nhắc trong roadmap.
   */
  private async buildMetaMany(
    articles: Article[],
    viewer?: User,
  ): Promise<Map<number, ArticleMeta>> {
    const result = new Map<number, ArticleMeta>();
    if (articles.length === 0) return result;

    const articleIds = articles.map((article) => article.id);
    const authorIds = [...new Set(articles.map((article) => article.authorId))];

    const [countRows, favoriteRows, followedIds] = await Promise.all([
      // 1 query: đếm lượt thích của TẤT CẢ bài, gom nhóm theo articleId.
      this.favoriteRepository
        .createQueryBuilder('favorite')
        .select('favorite.articleId', 'articleId')
        .addSelect('COUNT(*)', 'count')
        .where('favorite.articleId IN (:...articleIds)', { articleIds })
        .groupBy('favorite.articleId')
        .getRawMany<{ articleId: number; count: string }>(),

      // 1 query: trong số đó, viewer đã thích những bài nào.
      viewer
        ? this.favoriteRepository.find({
            where: { userId: viewer.id, articleId: In(articleIds) },
            select: { articleId: true },
          })
        : Promise.resolve([]),

      // 1 query: viewer đang follow những tác giả nào.
      this.profilesService.filterFollowedIds(viewer, authorIds),
    ]);

    // COUNT() của MySQL trả về chuỗi qua driver -> phải Number() lại.
    const countMap = new Map(
      countRows.map((row) => [Number(row.articleId), Number(row.count)]),
    );
    const favoritedIds = new Set(favoriteRows.map((row) => row.articleId));

    for (const article of articles) {
      result.set(article.id, {
        favoritesCount: countMap.get(article.id) ?? 0,
        favorited: favoritedIds.has(article.id),
        following: followedIds.has(article.authorId),
      });
    }

    return result;
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

  /**
   * Thích một bài viết.
   *
   * Idempotent bằng INSERT IGNORE — cùng cách đã dùng cho follow ở PR 3.
   * Bấm thích hai lần, hoặc client retry vì mạng chập chờn, đều cho cùng
   * kết quả thay vì lỗi trùng khoá.
   *
   * KHÁC follow ở một điểm: tự thích bài của mình là hợp lệ. Follow chính
   * mình thì vô nghĩa, còn tác giả đánh dấu bài mình thì bình thường.
   */
  async favorite(slug: string, viewer: User): Promise<ArticleWithMeta> {
    const article = await this.getBySlugOrFail(slug);

    await this.favoriteRepository
      .createQueryBuilder()
      .insert()
      .into(ArticleFavorite)
      .values({ userId: viewer.id, articleId: article.id })
      .orIgnore()
      .execute();

    this.logger.log(`User id=${viewer.id} da thich article id=${article.id}`);

    // Tính lại meta SAU khi ghi, để favoritesCount phản ánh đúng số mới.
    return { article, ...(await this.buildMeta(article, viewer)) };
  }

  /**
   * Bỏ thích. Cũng idempotent: bỏ thích bài chưa từng thích vẫn trả 200 —
   * DELETE vốn dĩ idempotent theo đúng tinh thần HTTP.
   */
  async unfavorite(slug: string, viewer: User): Promise<ArticleWithMeta> {
    const article = await this.getBySlugOrFail(slug);

    await this.favoriteRepository.delete({
      userId: viewer.id,
      articleId: article.id,
    });

    return { article, ...(await this.buildMeta(article, viewer)) };
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
