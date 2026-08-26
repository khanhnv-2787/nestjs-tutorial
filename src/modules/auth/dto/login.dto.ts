import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class LoginBodyDto {
  @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
  email: string;

  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  password: string;
}

export class LoginDto {
  @ValidateNested()
  @Type(() => LoginBodyDto)
  @IsObject({ message: i18nValidationMessage('validation.IS_OBJECT') })
  user: LoginBodyDto;
}
