import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenModule } from '../token/token.module';
import { CurrentUserController } from './current-user.controller';
import { UserFollow } from './entities/user-follow.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  // Thêm UserFollow để autoLoadEntities biết tới nó.
  // Không khai ở đây thì app chạy vẫn không "thấy" bảng user_follows.
  imports: [
    TypeOrmModule.forFeature([User, UserFollow]),
    // Cần để thu hồi token hiện tại khi user đổi mật khẩu.
    TokenModule,
  ],
  controllers: [UsersController, CurrentUserController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
