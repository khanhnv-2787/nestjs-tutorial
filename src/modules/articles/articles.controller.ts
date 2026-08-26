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
import { CreateArticleDto } from './dto/create-article.dto';
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
}
