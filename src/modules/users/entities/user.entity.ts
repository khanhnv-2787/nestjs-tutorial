import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// 'users' = tên bảng trong DB. Không ghi thì TypeORM tự suy ra "user".
// Ghi rõ số nhiều để khớp quy ước SQL phổ biến.
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ unique: true, length: 50 })
  username: string;

  // select: false -> KHÔNG được load trong query thường.
  // find(), findOne() sẽ trả về User mà `password` là undefined.
  // Muốn lấy phải yêu cầu tường minh bằng addSelect (dùng ở login, giai đoạn 3).
  @Column({ select: false })
  password: string;

  // type: 'text' vì bio có thể dài; varchar mặc định 255 ký tự là hơi chật.
  @Column({ type: 'text', nullable: true })
  bio: string | null;

  // Phải ghi rõ type: TS chỉ phát ra metadata "Object" cho union `string | null`,
  // TypeORM không suy ra được kiểu cột từ đó.
  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string | null;

  @CreateDateColumn() // TypeORM tự set lúc INSERT
  createdAt: Date;

  @UpdateDateColumn() // TypeORM tự set lại mỗi lần UPDATE
  updatedAt: Date;
}
