import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, ValidateNested } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { CreateArticleBodyDto } from './create-article.dto';

/**
 * PartialType biến mọi field thành optional, GIỮ NGUYÊN decorator validation
 * (kể cả thứ tự đảo ngược đã giải thích ở create-article.dto.ts).
 *
 * Lấy từ @nestjs/swagger chứ không phải @nestjs/mapped-types để kế thừa cả
 * metadata Swagger.
 */
export class UpdateArticleBodyDto extends PartialType(CreateArticleBodyDto) {}

export class UpdateArticleDto {
  @ValidateNested()
  @Type(() => UpdateArticleBodyDto)
  @IsObject({ message: i18nValidationMessage('validation.IS_OBJECT') })
  article: UpdateArticleBodyDto;
}
