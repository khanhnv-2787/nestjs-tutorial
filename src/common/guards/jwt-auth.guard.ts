import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { I18nService } from 'nestjs-i18n';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

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
    // Nhờ vậy @Public() đặt trên cả controller cũng có tác dụng.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // true = cho qua luôn, không đụng tới token.
    if (isPublic) return true;

    // Ngược lại chạy logic mặc định của AuthGuard('jwt'):
    // trích token -> xác minh chữ ký + hạn -> gọi JwtStrategy.validate()
    return super.canActivate(context);
  }

  /**
   * Passport gọi hàm này sau khi xác thực xong, để ta quyết định trả về gì.
   * Override chỉ nhằm thay thông báo lỗi mặc định "Unauthorized" bằng
   * thông báo đã dịch.
   */
  handleRequest<TUser>(err: unknown, user: TUser): TUser {
    if (err || !user) {
      throw err instanceof Error
        ? err
        : new UnauthorizedException(this.i18n.t('auth.invalid_token'));
    }
    return user;
  }
}
