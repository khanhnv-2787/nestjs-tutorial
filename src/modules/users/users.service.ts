import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
import { Not, Repository } from 'typeorm';
import { isDuplicateKeyError } from '../../common/database/is-duplicate-key-error';
import { AttachmentsService } from '../attachments/attachments.service';
import { ATTACHABLE_TYPE } from '../attachments/entities/attachment.entity';
import {
  TokenBlacklistService,
  type RevocableToken,
} from '../token/token-blacklist.service';
import { CreateUserBodyDto } from './dto/create-user.dto';
import { UpdateUserBodyDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

const BCRYPT_ROUNDS = 10;

/** Chỉ nhận ảnh. Kiểm theo MIME type do multer đọc từ phần header của file. */
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly tokenBlacklist: TokenBlacklistService,
    private readonly attachmentsService: AttachmentsService,
    private readonly i18n: I18nService,
  ) {}

  async createUser(data: CreateUserBodyDto): Promise<User> {
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

    const user = this.usersRepository.create({
      username: data.username,
      email: data.email,
      password: passwordHash,
    });

    try {
      const saved = await this.usersRepository.save(user);
      this.logger.log(`Đã tạo user id=${saved.id} username=${saved.username}`);
      return saved;
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        this.logger.warn(
          `Trùng khoá khi tạo user: email=${data.email} username=${data.username}`,
        );
        throw new ConflictException(this.i18n.t('user.credentials_taken'));
      }
      this.logger.error(
        `Lỗi khi tạo user email=${data.email}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * Cập nhật user đang đăng nhập.
   *
   * Nhận nguyên entity `user` (do JwtStrategy đã nạp) thay vì id — khỏi phải
   * query lại một lần nữa chỉ để lấy đúng bản ghi vừa mới đọc xong.
   *
   * @param currentToken token đang dùng để gọi request này. Nếu user đổi mật
   *   khẩu, token đó bị thu hồi để buộc đăng nhập lại — tránh việc người đã
   *   chiếm được token cũ vẫn dùng tiếp sau khi chủ tài khoản đã đổi mật khẩu.
   */
  async updateUser(
    user: User,
    data: UpdateUserBodyDto,
    currentToken?: RevocableToken,
  ): Promise<User> {
    // Chỉ kiểm trùng khi user THỰC SỰ đổi email hoặc username.
    // Not(user.id) để không tự tính chính mình là trùng.
    if (data.email && data.email !== user.email) {
      await this.assertNotTaken({ email: data.email }, user.id, 'email');
    }
    if (data.username && data.username !== user.username) {
      await this.assertNotTaken(
        { username: data.username },
        user.id,
        'username',
      );
    }

    const passwordChanged = data.password !== undefined;

    // Gán từng field một cách tường minh. KHÔNG dùng Object.assign(user, data)
    // để không có ngày nào đó DTO thêm field mới rồi lọt thẳng vào entity.
    if (data.email !== undefined) user.email = data.email;
    if (data.username !== undefined) user.username = data.username;
    if (data.bio !== undefined) user.bio = data.bio;
    if (data.image !== undefined) user.image = data.image;
    if (data.password !== undefined) {
      user.password = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    }

    try {
      const saved = await this.usersRepository.save(user);
      this.logger.log(`Đã cập nhật user id=${saved.id}`);

      // Thu hồi SAU khi lưu thành công. Làm trước thì nếu save lỗi, user vừa
      // bị đăng xuất mà mật khẩu chưa hề đổi.
      if (passwordChanged && currentToken) {
        await this.tokenBlacklist.revokeToken(currentToken);
        this.logger.log(
          `Đã thu hồi token của user id=${saved.id} do đổi mật khẩu`,
        );
      }

      return saved;
    } catch (error) {
      // Lưới an toàn cho race condition, giống hệt createUser.
      if (isDuplicateKeyError(error)) {
        throw new ConflictException(this.i18n.t('user.credentials_taken'));
      }
      this.logger.error(
        `Lỗi khi cập nhật user id=${user.id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * Đổi ảnh đại diện.
   *
   * Avatar cũ bị xoá cả file lẫn bản ghi — mỗi user chỉ giữ một ảnh, không
   * để rác tích lại trên đĩa sau mỗi lần đổi.
   */
  async updateAvatar(user: User, file?: Express.Multer.File): Promise<User> {
    if (!file) {
      throw new BadRequestException(this.i18n.t('attachment.required'));
    }
    if (!ALLOWED_AVATAR_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(this.i18n.t('attachment.invalid_type'));
    }

    await this.attachmentsService.removeAllFor(ATTACHABLE_TYPE.USER, user.id);

    const attachment = await this.attachmentsService.create(
      file,
      ATTACHABLE_TYPE.USER,
      user.id,
    );

    // Lưu ĐƯỜNG DẪN API chứ không phải đường dẫn trên đĩa. Client chỉ biết
    // tới id, không biết file nằm ở đâu trong hệ thống file.
    user.image = `/api/attachments/${attachment.id}`;

    const saved = await this.usersRepository.save(user);
    this.logger.log(`Đã đổi avatar cho user id=${saved.id}`);
    return saved;
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  /**
   * Tìm user KÈM password hash — CHỈ dùng cho việc xác thực đăng nhập.
   */
  async findByEmailWithPassword(
    email: string,
  ): Promise<(User & { password: string }) | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne() as Promise<(User & { password: string }) | null>;
  }

  private async assertNotTaken(
    where: { email: string } | { username: string },
    excludeUserId: number,
    field: 'email' | 'username',
  ): Promise<void> {
    const existing = await this.usersRepository.findOne({
      where: { ...where, id: Not(excludeUserId) },
    });
    if (existing) {
      throw new ConflictException(
        this.i18n.t(
          field === 'email' ? 'user.email_taken' : 'user.username_taken',
        ),
      );
    }
  }
}
