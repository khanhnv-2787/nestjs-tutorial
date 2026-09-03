import { ApiProperty } from '@nestjs/swagger';
import { ProfileDto } from '../../profiles/dto/profile-response.dto';
import { Comment } from '../entities/comment.entity';

/** Một bình luận kèm `following` — tính riêng theo người đang xem, giống ArticleMeta. */
export interface CommentWithFollowing {
  comment: Comment;
  following: boolean;
}

export class CommentDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Bài viết hay quá!' })
  body: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: ProfileDto })
  author: ProfileDto;
}

export class CommentResponseDto {
  @ApiProperty({ type: CommentDto })
  comment: CommentDto;
}

export function toCommentResponse(
  comment: Comment,
  following: boolean,
): CommentResponseDto {
  return {
    comment: {
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        username: comment.author.username,
        bio: comment.author.bio,
        image: comment.author.image,
        following,
      },
    },
  };
}

export class CommentsResponseDto {
  @ApiProperty({ type: [CommentDto] })
  comments: CommentDto[];
}

export function toCommentsResponse(
  items: CommentWithFollowing[],
): CommentsResponseDto {
  return {
    comments: items.map(
      ({ comment, following }) => toCommentResponse(comment, following).comment,
    ),
  };
}
