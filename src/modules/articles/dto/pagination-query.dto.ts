import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

/**
 * Tham số phân trang dùng chung cho mọi endpoint trả về danh sách.
 *
 * Thứ tự decorator đảo ngược — xem ghi chú ở create-article.dto.ts.
 */
export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsOptional()
  // Trần 100: không có trần thì ?limit=999999 sẽ kéo cả bảng về.
  @Max(100, { message: i18nValidationMessage('validation.MAX') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  // Query param luôn là chuỗi. @Type ép sang number TRƯỚC khi validate.
  @Type(() => Number)
  limit: number = 20;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Min(0, { message: i18nValidationMessage('validation.MIN') })
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  @Type(() => Number)
  offset: number = 0;
}
