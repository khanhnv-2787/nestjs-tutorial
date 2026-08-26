import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { PaginationQueryDto } from './pagination-query.dto';

/**
 * Tham số lọc cho GET /api/articles. Kế thừa limit/offset từ PaginationQueryDto.
 *
 * Feed KHÔNG dùng class này — feed chỉ nhận phân trang, không nhận bộ lọc,
 * đúng theo đặc tả RealWorld.
 */
export class ListArticlesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Lọc theo tên tag', example: 'nestjs' })
  @IsOptional()
  @MaxLength(50, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  tag?: string;

  @ApiPropertyOptional({ description: 'Lọc theo username tác giả' })
  @IsOptional()
  @MaxLength(50, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  author?: string;

  @ApiPropertyOptional({ description: 'Lọc bài được username này thích' })
  @IsOptional()
  @MaxLength(50, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  favorited?: string;
}
