import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFollow } from '../users/entities/user-follow.entity';
import { UsersModule } from '../users/users.module';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
  imports: [
    // forFeature có thể gọi ở NHIỀU module cho cùng một entity —
    // mỗi module nhận repository riêng trong phạm vi của mình.
    TypeOrmModule.forFeature([UserFollow]),
    // Cần UsersService.findByUsername.
    UsersModule,
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  // export để PR 4 (ArticlesModule) tính được field `following` của tác giả.
  exports: [ProfilesService],
})
export class ProfilesModule {}
