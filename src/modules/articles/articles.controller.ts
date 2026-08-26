import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OptionalAuth } from '../../common/decorators/optional-auth.decorator';
import { BEARER_AUTH_NAME } from '../../config/swagger.config';
import { User } from '../users/entities/user.entity';
import { ArticlesService } from './articles.service';
import {
  toArticleResponse,
  type ArticleResponseDto,
} from './dto/article-response.dto';
import {
  toArticlesResponse,
  type ArticlesResponseDto,
} from './dto/article-response.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@ApiTags('articles')
@ApiBearerAuth(BEARER_AUTH_NAME)
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  // POST /api/articles
  @ApiOperation({ summary: 'Tạo bài viết mới' })
  @ApiBadRequestResponse({ description: 'Dữ liệu gửi lên không hợp lệ' })
  @ApiUnauthorizedResponse({
    description: 'Thiếu token hoặc token không hợp lệ',
  })
  @Post()
  async create(
    @CurrentUser() author: User,
    @Body() dto: CreateArticleDto,
  ): Promise<ArticleResponseDto> {
    const { article, ...meta } = await this.articlesService.createArticle(
      author,
      dto.article,
    );
    return toArticleResponse(article, meta);
  }

  // GET /api/articles
  //
  // Khai TRƯỚC @Get(':slug') cho dễ đọc. Về mặt định tuyến thì không bắt
  // buộc — '' và ':slug' là hai đường dẫn khác nhau nên Nest không nhầm.
  @OptionalAuth()
  @ApiOperation({
    summary: 'Danh sách bài viết',
    description:
      'Không cần đăng nhập. Lọc theo `tag`, `author`, `favorited` (kết hợp được), phân trang bằng `limit`/`offset`. Sắp xếp mới nhất trước.',
  })
  @ApiBadRequestResponse({ description: 'Tham số lọc không hợp lệ' })
  @Get()
  async list(
    @Query() query: ListArticlesQueryDto,
    @CurrentUser() viewer: User | undefined,
  ): Promise<ArticlesResponseDto> {
    const { items, articlesCount } = await this.articlesService.listArticles(
      query,
      viewer,
    );
    return toArticlesResponse(items, articlesCount);
  }

  // GET /api/articles/:slug
  @OptionalAuth()
  @ApiOperation({
    summary: 'Xem một bài viết',
    description:
      'Không cần đăng nhập. Nếu có token hợp lệ, `favorited` và `author.following` phản ánh quan hệ thật.',
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy bài viết' })
  @Get(':slug')
  async findOne(
    @Param('slug') slug: string,
    @CurrentUser() viewer: User | undefined,
  ): Promise<ArticleResponseDto> {
    const { article, ...meta } = await this.articlesService.findBySlug(
      slug,
      viewer,
    );
    return toArticleResponse(article, meta);
  }

  // PUT /api/articles/:slug
  @ApiOperation({
    summary: 'Cập nhật bài viết',
    description:
      'Chỉ tác giả được sửa. Đổi `title` sẽ sinh lại `slug` — đường dẫn cũ không còn dùng được.',
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy bài viết' })
  @ApiForbiddenResponse({ description: 'Không phải tác giả của bài viết' })
  @ApiUnauthorizedResponse({
    description: 'Thiếu token hoặc token không hợp lệ',
  })
  @Put(':slug')
  async update(
    @Param('slug') slug: string,
    @CurrentUser() viewer: User,
    @Body() dto: UpdateArticleDto,
  ): Promise<ArticleResponseDto> {
    const { article, ...meta } = await this.articlesService.updateArticle(
      slug,
      viewer,
      dto.article,
    );
    return toArticleResponse(article, meta);
  }

  // DELETE /api/articles/:slug
  @ApiOperation({
    summary: 'Xoá bài viết',
    description: 'Chỉ tác giả được xoá.',
  })
  @ApiNoContentResponse({ description: 'Đã xoá' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy bài viết' })
  @ApiForbiddenResponse({ description: 'Không phải tác giả của bài viết' })
  @ApiUnauthorizedResponse({
    description: 'Thiếu token hoặc token không hợp lệ',
  })
  // 204: xoá thành công, không có gì để trả về.
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':slug')
  async remove(
    @Param('slug') slug: string,
    @CurrentUser() viewer: User,
  ): Promise<void> {
    await this.articlesService.deleteArticle(slug, viewer);
  }

  // POST /api/articles/:slug/favorite
  // Bắt buộc đăng nhập — phải biết AI thích thì mới lưu được.
  @ApiOperation({
    summary: 'Thích một bài viết',
    description: 'Idempotent — thích lại bài đã thích vẫn trả 200.',
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy bài viết' })
  @ApiUnauthorizedResponse({
    description: 'Thiếu token hoặc token không hợp lệ',
  })
  // 200 chứ không phải 201: không tạo ra tài nguyên có URL riêng, và
  // response trả về bài viết chứ không phải thứ vừa tạo.
  @HttpCode(HttpStatus.OK)
  @Post(':slug/favorite')
  async favorite(
    @Param('slug') slug: string,
    @CurrentUser() viewer: User,
  ): Promise<ArticleResponseDto> {
    const { article, ...meta } = await this.articlesService.favorite(
      slug,
      viewer,
    );
    return toArticleResponse(article, meta);
  }

  // DELETE /api/articles/:slug/favorite
  @ApiOperation({
    summary: 'Bỏ thích một bài viết',
    description: 'Idempotent — bỏ thích bài chưa thích vẫn trả 200.',
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy bài viết' })
  @ApiUnauthorizedResponse({
    description: 'Thiếu token hoặc token không hợp lệ',
  })
  @Delete(':slug/favorite')
  async unfavorite(
    @Param('slug') slug: string,
    @CurrentUser() viewer: User,
  ): Promise<ArticleResponseDto> {
    const { article, ...meta } = await this.articlesService.unfavorite(
      slug,
      viewer,
    );
    return toArticleResponse(article, meta);
  }
}
