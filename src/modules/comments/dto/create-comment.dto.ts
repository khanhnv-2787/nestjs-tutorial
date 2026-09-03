// LƯU Ý VỀ THỨ TỰ DECORATOR: xem ghi chú ở articles/dto/create-article.dto.ts.
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateCommentBodyDto {
  @MaxLength(1000, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  body: string;
}

export class CreateCommentDto {
  @ValidateNested()
  @Type(() => CreateCommentBodyDto)
  @IsObject({ message: i18nValidationMessage('validation.IS_OBJECT') })
  comment: CreateCommentBodyDto;
}
