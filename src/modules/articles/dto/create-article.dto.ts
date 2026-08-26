/**
 * LƯU Ý VỀ THỨ TỰ DECORATOR
 *
 * class-validator đăng ký decorator từ DƯỚI LÊN, và `stopAtFirstError` (bật ở
 * main.ts) chỉ báo lỗi ĐẦU TIÊN được đăng ký. Nên decorator nằm SÁT property
 * là cái được kiểm trước.
 *
 * Vì vậy luật cơ bản nhất (@IsString, @IsArray, @IsObject) phải đặt CUỐI —
 * nếu không, field bị thiếu sẽ báo "không được vượt quá 255 ký tự" thay vì
 * "phải là chuỗi". Đừng sắp xếp lại cho "dễ đọc".
 */
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateArticleBodyDto {
  // MaxLength khớp đúng độ dài cột trong DB (varchar 255) — validation và
  // schema không được lệch nhau, nếu không MySQL sẽ là nơi báo lỗi.
  @MaxLength(255, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  title: string;

  @MaxLength(500, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  description: string;

  // body là cột TEXT nên không giới hạn 255, nhưng vẫn phải có trần —
  // không có trần nghĩa là ai đó gửi 50MB text cũng được nhận.
  @MaxLength(50000, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  body: string;

  @IsOptional()
  @ArrayMaxSize(10, {
    message: i18nValidationMessage('validation.ARRAY_MAX_SIZE'),
  })
  // `each: true` -> áp luật cho TỪNG PHẦN TỬ của mảng, không phải cho mảng.
  @IsString({
    each: true,
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @MaxLength(50, {
    each: true,
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  @IsArray({ message: i18nValidationMessage('validation.IS_ARRAY') })
  tagList?: string[];
}

export class CreateArticleDto {
  @ValidateNested()
  @Type(() => CreateArticleBodyDto)
  @IsObject({ message: i18nValidationMessage('validation.IS_OBJECT') })
  article: CreateArticleBodyDto;
}
