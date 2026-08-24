import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { CreateUserBodyDto } from './create-user.dto';

/**
 * PartialType biến mọi field của CreateUserBodyDto thành optional,
 * GIỮ NGUYÊN toàn bộ decorator validation. Lấy từ @nestjs/swagger
 * (không phải @nestjs/mapped-types) để metadata Swagger cũng được kế thừa.
 *
 * Kế thừa được: username, email, password — đều thành optional.
 * Thêm mới: bio, image (không có ở lúc đăng ký).
 */
export class UpdateUserBodyDto extends PartialType(CreateUserBodyDto) {
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MaxLength(1000, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  bio?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MaxLength(255, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  image?: string;
}

export class UpdateUserDto {
  @IsObject({ message: i18nValidationMessage('validation.IS_OBJECT') })
  @ValidateNested()
  @Type(() => UpdateUserBodyDto)
  user: UpdateUserBodyDto;
}
