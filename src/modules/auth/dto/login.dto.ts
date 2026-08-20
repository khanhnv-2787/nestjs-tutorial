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

  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  password: string;
}

export class LoginDto {
  @IsObject({ message: i18nValidationMessage('validation.IS_OBJECT') })
  @ValidateNested()
  @Type(() => LoginBodyDto)
  user: LoginBodyDto;
}
