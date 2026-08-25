import { randomUUID } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
import { TokenBlacklistService } from '../token/token-blacklist.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginBodyDto } from './dto/login.dto';
import type { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly tokenBlacklist: TokenBlacklistService,
    private readonly i18n: I18nService,
  ) {}

  async login(data: LoginBodyDto): Promise<{ user: User; token: string }> {
    const user = await this.usersService.findByEmailWithPassword(data.email);

    // MỘT thông báo duy nhất cho cả "email không tồn tại" lẫn "sai mật khẩu".
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException(this.i18n.t('auth.invalid_credentials'));
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      // jti = JWT ID, claim chuẩn của RFC 7519 dùng để định danh từng token.
      // Không có nó thì không thể thu hồi một token cụ thể.
      jti: randomUUID(),
    });

    return { user, token };
  }

  /**
   * Đăng xuất = đưa token hiện tại vào blacklist.
   *
   * JWT là stateless, server không lưu gì -> không thể "xoá" một token.
   * Cách duy nhất để vô hiệu hoá nó là ghi lại là "đã thu hồi" và kiểm tra
   * ở mỗi request sau đó.
   */
  async logout(payload: JwtPayload): Promise<void> {
    await this.tokenBlacklist.revokeToken(payload);
  }
}
