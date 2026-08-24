import { SetMetadata } from '@nestjs/common';

/** Khoá metadata — guard sẽ dùng đúng khoá này để tra ngược lại. */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Đánh dấu một route (hoặc cả controller) là công khai, bỏ qua JwtAuthGuard.
 *
 * SetMetadata chỉ làm một việc: gắn cặp key-value vào metadata của
 * class/method đó. Nó KHÔNG tự có tác dụng gì — phải có ai đó đọc lại,
 * và người đọc chính là JwtAuthGuard qua Reflector.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
