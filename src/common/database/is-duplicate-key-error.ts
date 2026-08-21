/**
 * Nhận biết lỗi vi phạm ràng buộc UNIQUE của MySQL.
 *
 * Đây là chi tiết của driver, KHÔNG phải luật nghiệp vụ — nên nằm ở common/
 * để articles, comments, tags... dùng lại thay vì mỗi service tự viết một bản.
 */

/** MySQL trả errno 1062 (ER_DUP_ENTRY) khi INSERT/UPDATE vi phạm UNIQUE. */
const MYSQL_ER_DUP_ENTRY = 1062;

export function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'driverError' in error &&
    (error as { driverError?: { errno?: number } }).driverError?.errno ===
      MYSQL_ER_DUP_ENTRY
  );
}
