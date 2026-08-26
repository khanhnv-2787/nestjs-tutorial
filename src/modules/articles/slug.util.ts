import { randomBytes } from 'node:crypto';

/**
 * Sinh slug từ tiêu đề.
 *
 * "Cách học NestJS!" -> "cach-hoc-nestjs-a1b2c3"
 *
 * Hậu tố ngẫu nhiên để hai bài trùng tiêu đề không đụng nhau. Cách khác là
 * thêm số đếm (-1, -2), nhưng cách đó cần một truy vấn để biết đã có bao
 * nhiêu bài trùng, và vẫn có khe race giữa lúc đếm và lúc insert.
 */
export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    // NFD tách chữ và dấu thành hai ký tự riêng, rồi xoá phần dấu.
    // "ế" -> "e" + dấu -> "e"
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // đ/Đ không phải là "d + dấu" nên NFD không xử lý được, phải thay tay.
    .replace(/đ/g, 'd')
    // mọi thứ không phải chữ/số thành gạch ngang
    .replace(/[^a-z0-9]+/g, '-')
    // gộp gạch liên tiếp và cắt gạch ở hai đầu
    .replace(/^-+|-+$/g, '')
    // chừa chỗ cho hậu tố, tổng không vượt quá varchar(255)
    .slice(0, 240);

  const suffix = randomBytes(3).toString('hex'); // 6 ký tự

  // Tiêu đề toàn ký tự đặc biệt -> base rỗng -> slug chỉ còn hậu tố.
  return base ? `${base}-${suffix}` : suffix;
}
