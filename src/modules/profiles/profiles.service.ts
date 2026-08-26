import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { In, Repository } from 'typeorm';
import { UserFollow } from '../users/entities/user-follow.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(UserFollow)
    private readonly followRepository: Repository<UserFollow>,
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {}

  async getProfile(
    username: string,
    viewer?: User,
  ): Promise<{ user: User; following: boolean }> {
    const user = await this.getUserOrFail(username);
    return { user, following: await this.isFollowing(viewer, user) };
  }

  /**
   * Follow một user. Idempotent: follow lại người đã follow -> vẫn 200,
   * không phải lỗi. Client bấm hai lần hay retry đều cho cùng kết quả.
   */
  async follow(
    follower: User,
    username: string,
  ): Promise<{ user: User; following: boolean }> {
    const target = await this.getUserOrFail(username);
    this.assertNotSelf(follower, target);

    // orIgnore() -> `INSERT IGNORE INTO` của MySQL: đã tồn tại thì bỏ qua,
    // không ném lỗi trùng khoá.
    //
    // Cách này nhỉnh hơn "kiểm tra tồn tại rồi mới insert": chỉ MỘT lượt
    // xuống DB, và không có khe hở race condition giữa hai câu lệnh.
    await this.followRepository
      .createQueryBuilder()
      .insert()
      .into(UserFollow)
      .values({ followerId: follower.id, followingId: target.id })
      .orIgnore()
      .execute();

    return { user: target, following: true };
  }

  /**
   * Unfollow. Cũng idempotent: unfollow người chưa từng follow -> vẫn 200.
   * DELETE vốn dĩ idempotent theo đúng tinh thần HTTP.
   */
  async unfollow(
    follower: User,
    username: string,
  ): Promise<{ user: User; following: boolean }> {
    const target = await this.getUserOrFail(username);
    this.assertNotSelf(follower, target);

    await this.followRepository.delete({
      followerId: follower.id,
      followingId: target.id,
    });

    return { user: target, following: false };
  }

  /**
   * Viewer có đang follow target không.
   *
   * Trả false ngay khi không có viewer (khách vãng lai) hoặc khi viewer tự xem
   * profile của chính mình — không ai tự follow mình được.
   */
  async isFollowing(viewer: User | undefined, target: User): Promise<boolean> {
    if (!viewer || viewer.id === target.id) return false;

    // existsBy sinh ra SELECT 1 ... LIMIT 1 — rẻ hơn findOne vì không nạp
    // cột nào về, và dùng đúng khoá chính ghép (followerId, followingId).
    return this.followRepository.existsBy({
      followerId: viewer.id,
      followingId: target.id,
    });
  }

  /**
   * Trong danh sách userIds, viewer đang follow những ai.
   *
   * Bản GỘP của isFollowing, dùng khi cần kiểm nhiều người cùng lúc (danh
   * sách bài viết). Gọi isFollowing trong vòng lặp sẽ sinh N query — đây
   * chính là N+1, chỉ khác là ở tầng nghiệp vụ chứ không phải tầng ORM.
   */
  async filterFollowedIds(
    viewer: User | undefined,
    userIds: number[],
  ): Promise<Set<number>> {
    if (!viewer || userIds.length === 0) return new Set();

    const rows = await this.followRepository.find({
      where: { followerId: viewer.id, followingId: In(userIds) },
      select: { followingId: true },
    });

    return new Set(rows.map((row) => row.followingId));
  }

  private async getUserOrFail(username: string): Promise<User> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new NotFoundException(
        this.i18n.t('user.not_found_username', { args: { username } }),
      );
    }
    return user;
  }

  private assertNotSelf(follower: User, target: User): void {
    if (follower.id === target.id) {
      throw new BadRequestException(this.i18n.t('profile.cannot_follow_self'));
    }
  }
}
