import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import {
  toCommentResponse,
  toCommentsResponse,
  type CommentResponseDto,
  type CommentsResponseDto,
} from './dto/comment-response.dto';

@ApiTags('comments')
@ApiBearerAuth(BEARER_AUTH_NAME)
@Controller('articles/:slug/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // POST /api/articles/:slug/comments
  @ApiOperation({ summary: 'Thêm bình luận vào bài viết' })
  @ApiBadRequestResponse({ description: 'Dữ liệu gửi lên không hợp lệ' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy bài viết' })
  @ApiUnauthorizedResponse({
    description: 'Thiếu token hoặc token không hợp lệ',
  })
  @Post()
  async create(
    @Param('slug') slug: string,
    @CurrentUser() author: User,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const { comment, following } = await this.commentsService.addComment(
      slug,
      author,
      dto.comment.body,
    );
    return toCommentResponse(comment, following);
  }

  // GET /api/articles/:slug/comments
  @OptionalAuth()
  @ApiOperation({
    summary: 'Danh sách bình luận của bài viết',
    description:
      'Không cần đăng nhập. Nếu có token hợp lệ, `author.following` của mỗi bình luận phản ánh quan hệ thật. Sắp xếp cũ nhất trước.',
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy bài viết' })
  @Get()
  async list(
    @Param('slug') slug: string,
    @CurrentUser() viewer: User | undefined,
  ): Promise<CommentsResponseDto> {
    const items = await this.commentsService.listComments(slug, viewer);
    return toCommentsResponse(items);
  }

  // DELETE /api/articles/:slug/comments/:id
  @ApiOperation({
    summary: 'Xoá bình luận',
    description: 'Chỉ tác giả của bình luận được xoá.',
  })
  @ApiNoContentResponse({ description: 'Đã xoá' })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy bài viết hoặc bình luận',
  })
  @ApiForbiddenResponse({ description: 'Không phải tác giả của bình luận' })
  @ApiUnauthorizedResponse({
    description: 'Thiếu token hoặc token không hợp lệ',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(
    @Param('slug') slug: string,
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() viewer: User,
  ): Promise<void> {
    await this.commentsService.deleteComment(slug, id, viewer);
  }
}
