import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { I18nService } from 'nestjs-i18n';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Env } from '../../../config/env.validation';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { TokenBlacklistService } from '../token-blacklist.service';

/** Hình dạng payload mà AuthService ký ra. */
export interface JwtPayload {
  sub: number;
  email: string;
  jti: string;
  iat: number;
  exp: number;
}

/** Request sau khi qua strategy sẽ có thêm field này. */
interface RequestWithPayload {
  jwtPayload?: JwtPayload;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService<Env, true>,
    private readonly usersService: UsersService,
    private readonly tokenBlacklist: TokenBlacklistService,
    private readonly i18n: I18nService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET', { infer: true }),
      // passReqToCallback: true -> validate() nhận thêm tham số req ở ĐẦU.
      // Cần để gắn payload vào request cho endpoint logout dùng lại.
      passReqToCallback: true,
    });
  }

  /**
   * Passport chỉ gọi hàm này SAU KHI đã xác minh chữ ký và hạn dùng.
   * Chú ý thứ tự tham số: có passReqToCallback nên req đứng TRƯỚC payload.
   */
  async validate(req: RequestWithPayload, payload: JwtPayload): Promise<User> {
    // Token phát ra trước khi có cơ chế jti sẽ không có field này.
    // Từ chối luôn: không có jti thì không thể thu hồi được.
    if (!payload.jti) {
      throw new UnauthorizedException(this.i18n.t('auth.invalid_token'));
    }

    // Đã logout -> token vẫn đúng chữ ký và chưa hết hạn, nhưng bị thu hồi.
    if (await this.tokenBlacklist.isRevoked(payload.jti)) {
      throw new UnauthorizedException(this.i18n.t('auth.token_revoked'));
    }

    // Token hợp lệ KHÔNG có nghĩa là user còn tồn tại.
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException(this.i18n.t('auth.invalid_token'));
    }

    // Gắn payload vào request để @TokenPayload() đọc được ở controller.
    req.jwtPayload = payload;

    return user;
  }
}
