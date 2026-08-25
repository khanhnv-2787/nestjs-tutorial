/**
 * Các loại ảnh được phép làm avatar.
 *
 * Khai ở một chỗ để `fileFilter` (chặn sớm, trước khi nạp file vào RAM) và
 * kiểm tra ở service (lưới an toàn nếu ai đó gỡ fileFilter) không lệch nhau.
 */
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export function isAllowedImageMime(mime: string): boolean {
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mime);
}
