import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

// Tầng trong: dữ liệu thật
export class CreateUserBodyDto {
  @MaxLength(50, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  username: string;

  @MaxLength(255, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
  email: string;

  @MinLength(8, { message: i18nValidationMessage('validation.MIN_LENGTH') })
  // 72 là giới hạn của thuật toán bcrypt — phần dư bị cắt âm thầm
  @MaxLength(72, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  password: string;
}

// Tầng ngoài: cái vỏ { user: ... } theo đặc tả RealWorld
export class CreateUserDto {
  // @ValidateNested: bảo class-validator "đi sâu vào object con mà kiểm tra".
  // Thiếu nó thì mọi rule bên trong CreateUserBodyDto bị bỏ qua HOÀN TOÀN.
  @ValidateNested()
  // @Type: bảo class-transformer biến object thường thành instance CreateUserBodyDto.
  // Thiếu nó thì @ValidateNested không biết phải kiểm theo class nào.
  @Type(() => CreateUserBodyDto)
  @IsObject({ message: i18nValidationMessage('validation.IS_OBJECT') })
  user: CreateUserBodyDto;
}
