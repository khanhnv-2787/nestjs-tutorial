import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { I18nService } from 'nestjs-i18n';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Env } from '../../../config/env.validation';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';

/** Hình dạng payload mà AuthService đã ký ở bước 3. */
export interface JwtPayload {
  sub: number;
  email: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService<Env, true>,
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {
    super({
      // Lấy token từ header: Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // false = passport tự từ chối token hết hạn, ta không phải tự kiểm exp.
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET', { infer: true }),
    });
  }

  /**
   * Passport chỉ gọi hàm này SAU KHI đã xác minh chữ ký và hạn dùng.
   * Tới đây token chắc chắn hợp lệ về mặt mã hoá.
   *
   * Giá trị trả về được Passport gán vào `request.user`.
   */
  async validate(payload: JwtPayload): Promise<User> {
    // Token hợp lệ KHÔNG có nghĩa là user còn tồn tại: có thể đã bị xoá
    // sau khi token được phát. Nên vẫn phải kiểm tra lại trong DB.
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException(this.i18n.t('auth.invalid_token'));
    }

    return user;
  }
}
