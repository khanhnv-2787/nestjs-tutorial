import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

/**
 * Tham số lọc và phân trang cho GET /api/articles.
 *
 * Thứ tự decorator đảo ngược — xem ghi chú ở create-article.dto.ts.
 */
export class ListArticlesQueryDto {
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

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsOptional()
  // Trần 100: không có trần thì ?limit=999999 sẽ kéo cả bảng về.
  @Max(100, { message: i18nValidationMessage('validation.MAX') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  // Query param luôn là chuỗi. @Type ép sang number TRƯỚC khi validate,
  // nhờ transform: true bật ở ValidationPipe.
  @Type(() => Number)
  limit: number = 20;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Min(0, { message: i18nValidationMessage('validation.MIN') })
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  @Type(() => Number)
  offset: number = 0;
}
