import { SetMetadata } from '@nestjs/common';

export const IS_OPTIONAL_AUTH_KEY = 'isOptionalAuth';

/**
 * Đánh dấu route cho phép truy cập KHÔNG cần token, nhưng nếu CÓ token hợp lệ
 * thì vẫn nạp user vào request.
 *
 * Khác @Public() ở chỗ: @Public() bỏ qua hoàn toàn việc xác thực, request.user
 * luôn undefined. @OptionalAuth() vẫn cố xác thực, chỉ là không bắt buộc.
 *
 * Token gửi lên mà SAI (hết hạn, chữ ký lỗi, đã thu hồi) thì vẫn bị 401 —
 * "không bắt buộc" không có nghĩa là "chấp nhận token rác".
 */
export const OptionalAuth = () => SetMetadata(IS_OPTIONAL_AUTH_KEY, true);
