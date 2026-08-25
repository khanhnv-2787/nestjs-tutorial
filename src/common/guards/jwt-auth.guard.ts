import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { I18nService } from 'nestjs-i18n';
import { ExtractJwt } from 'passport-jwt';
import { IS_OPTIONAL_AUTH_KEY } from '../decorators/optional-auth.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/** Dùng đúng cách trích token mà JwtStrategy đang cấu hình. */
const extractToken = ExtractJwt.fromAuthHeaderAsBearerToken();

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly i18n: I18nService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // getAllAndOverride đọc metadata ở HAI cấp và lấy cấp cụ thể hơn:
    //   getHandler() = method đang được gọi
    //   getClass()   = controller chứa method đó
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // true = cho qua luôn, không đụng tới token.
    if (isPublic) return true;

    // Ngược lại chạy logic mặc định của AuthGuard('jwt').
    return super.canActivate(context);
  }

  /**
   * Passport gọi hàm này sau khi xác thực xong, để ta quyết định trả về gì.
   *
   * Với route @OptionalAuth(): chỉ cho qua khi request KHÔNG mang token nào.
   *
   * KHÔNG được dựa vào `err` để phân biệt: passport-jwt báo "chữ ký sai" và
   * "token hết hạn" bằng fail() chứ không phải error(), nên err vẫn là null
   * và lỗi nằm ở `info`. Dựa vào err sẽ khiến token rác được cho qua âm thầm.
   * Vì vậy phải tự kiểm xem header có mang token hay không.
   */
  handleRequest<TUser>(
    err: unknown,
    user: TUser,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    const isOptional = this.reflector.getAllAndOverride<boolean>(
      IS_OPTIONAL_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isOptional && !user) {
      const request = context.switchToHttp().getRequest<Request>();
      const hasToken = extractToken(request) !== null;

      // Không mang token -> khách vãng lai, cho qua với user rỗng.
      // Có mang token mà tới đây vẫn không có user -> token hỏng, phải chặn.
      if (!hasToken) return undefined as TUser;
    }

    if (err || !user) {
      throw err instanceof Error
        ? err
        : new UnauthorizedException(this.i18n.t('auth.invalid_token'));
    }

    return user;
  }
}
