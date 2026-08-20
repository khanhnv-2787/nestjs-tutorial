import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserBodyDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    // @InjectRepository(User) lấy đúng provider mà forFeature([User]) đã tạo.
    // Đây là DI: service không tự tạo repository, ai đó đưa cho nó.
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createUser(data: CreateUserBodyDto): Promise<User> {
    // Kiểm tra sớm để trả lỗi đẹp. Nhưng ĐÂY KHÔNG PHẢI đảm bảo cuối cùng:
    // hai request cùng lúc đều có thể thấy "chưa tồn tại". Ràng buộc UNIQUE
    // ở DB mới là thứ chặn thật -> vẫn phải bắt lỗi 1062 bên dưới.
    const existing = await this.usersRepository.findOne({
      where: [{ email: data.email }, { username: data.username }],
    });
    if (existing) {
      throw new ConflictException(
        existing.email === data.email
          ? 'Email đã được sử dụng'
          : 'Username đã được sử dụng',
      );
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    // create() chỉ tạo instance trong bộ nhớ, chưa chạm DB.
    const user = this.usersRepository.create({
      username: data.username,
      email: data.email,
      password: passwordHash,
    });

    try {
      // save() mới thực sự INSERT.
      return await this.usersRepository.save(user);
    } catch (error) {
      // Lưới an toàn cho race condition: 2 request cùng lúc lọt qua findOne ở trên.
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('Email hoặc username đã được sử dụng');
      }
      throw error;
    }
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  private isDuplicateKeyError(error: unknown): boolean {
    // MySQL trả errno 1062 cho vi phạm UNIQUE.
    return (
      typeof error === 'object' &&
      error !== null &&
      'driverError' in error &&
      (error.driverError as { errno?: number })?.errno === 1062
    );
  }
}
