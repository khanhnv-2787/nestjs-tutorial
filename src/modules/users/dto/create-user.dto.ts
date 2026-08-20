import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

// Tầng trong: dữ liệu thật
export class CreateUserBodyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72) // giới hạn của thuật toán bcrypt
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
  user: CreateUserBodyDto;
}
