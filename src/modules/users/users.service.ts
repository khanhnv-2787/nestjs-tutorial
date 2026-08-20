import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { isDuplicateKeyError } from '../../common/database/is-duplicate-key-error';
import { CreateUserBodyDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsersService {
  // Logger của Nest, gắn tên class làm context -> log ra có tiền tố [UsersService].
  private readonly logger = new Logger(UsersService.name);

  constructor(
    // @InjectRepository(User) lấy đúng provider mà forFeature([User]) đã tạo.
    // Đây là DI: service không tự tạo repository, ai đó đưa cho nó.
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly i18n: I18nService,
  ) {}

  async createUser(data: CreateUserBodyDto): Promise<User> {
    // Kiểm tra sớm để trả lỗi đẹp. Nhưng ĐÂY KHÔNG PHẢI đảm bảo cuối cùng:
    // hai request cùng lúc đều có thể thấy "chưa tồn tại". Ràng buộc UNIQUE
    // ở DB mới là thứ chặn thật -> vẫn phải bắt lỗi trùng khoá bên dưới.
    const existing = await this.usersRepository.findOne({
      where: [{ email: data.email }, { username: data.username }],
    });
    if (existing) {
      throw new ConflictException(
        existing.email === data.email
          ? this.i18n.t('user.email_taken')
          : this.i18n.t('user.username_taken'),
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
      const saved = await this.usersRepository.save(user);
      this.logger.log(`Đã tạo user id=${saved.id} username=${saved.username}`);
      return saved;
    } catch (error) {
      // Lưới an toàn cho race condition: 2 request cùng lúc lọt qua findOne ở trên.
      if (isDuplicateKeyError(error)) {
        // Log ở mức warn kèm ngữ cảnh: đây là chuyện bất thường (2 request
        // cùng lúc) nhưng không phải sự cố hệ thống.
        this.logger.warn(
          `Trùng khoá khi tạo user: email=${data.email} username=${data.username}`,
        );
        throw new ConflictException(this.i18n.t('user.credentials_taken'));
      }
      // Lỗi không lường trước -> log kèm nguyên nhân gốc rồi ném lên tầng trên.
      this.logger.error(
        `Lỗi khi tạo user email=${data.email}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }
  /**
   * Tìm user KÈM password hash — CHỈ dùng cho việc xác thực đăng nhập.
   * Mọi chỗ khác phải dùng findById để hash không bị load ra vô ý.
   *
   * Kiểu trả về giao với `{ password: string }`: query này có addSelect nên
   * password CHẮC CHẮN có mặt, nhờ vậy AuthService dùng được mà không phải
   * kiểm undefined — dù entity khai `password?`.
   */
  async findByEmailWithPassword(
    email: string,
  ): Promise<(User & { password: string }) | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      // addSelect ghi đè select: false của entity cho đúng query này
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne() as Promise<(User & { password: string }) | null>;
  }
}
