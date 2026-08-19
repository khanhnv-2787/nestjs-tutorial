import 'dotenv/config'; // nạp .env vào process.env — không có Nest ở đây nên phải tự làm
import { DataSource } from 'typeorm';
import { validateEnv } from '../config/env.validation';

// CLI chạy NGOÀI Nest: không container DI, không ConfigService.
// Nhưng vẫn dùng lại đúng hàm validate cũ -> luật kiểm tra env chỉ có MỘT nguồn.
const env = validateEnv(process.env);

// TypeORM CLI đi tìm `export default` là một DataSource.
export default new DataSource({
  type: 'mysql',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,

  // Glob tính từ thư mục gốc repo (nơi bạn gõ lệnh pnpm).
  // CLI đọc .ts trực tiếp nhờ ts-node, không cần build trước.
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
});
