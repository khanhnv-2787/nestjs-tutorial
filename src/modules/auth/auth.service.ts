import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginBodyDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    // UsersModule đã export UsersService -> AuthModule import UsersModule là inject được.
    private readonly usersService: UsersService,
    // JwtService do JwtModule.registerAsync cung cấp, đã gắn sẵn secret + expiresIn.
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
  ) {}

  async login(data: LoginBodyDto): Promise<{ user: User; token: string }> {
    // Phải dùng hàm ...WithPassword vì cột password khai select: false,
    // findOne thường sẽ trả về user mà password là undefined.
    const user = await this.usersService.findByEmailWithPassword(data.email);

    // MỘT thông báo duy nhất cho cả "email không tồn tại" lẫn "sai mật khẩu".
    // Tách ra sẽ cho phép người ngoài dò xem email nào đã đăng ký.
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException(this.i18n.t('auth.invalid_credentials'));
    }

    // Payload đi vào token: chỉ đủ để nhận diện user.
    // JWT được KÝ chứ không được MÃ HOÁ — ai cũng đọc được nội dung,
    // nên tuyệt đối không nhét password hay dữ liệu nhạy cảm vào đây.
    // `sub` (subject) là tên chuẩn của JWT cho định danh chủ thể.
    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return { user, token };
  }
}
