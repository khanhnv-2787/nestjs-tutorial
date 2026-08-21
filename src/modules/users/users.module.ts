import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrentUserController } from './current-user.controller';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  // forFeature = "module này cần repository của những entity sau".
  // Nó tạo ra provider Repository<User> trong phạm vi module này,
  // ĐỒNG THỜI báo cho autoLoadEntities (bật ở DatabaseModule) biết
  // entity User tồn tại -> giờ app mới thực sự biết bảng users.
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController, CurrentUserController],
  providers: [UsersService],
  // exports để AuthModule dùng lại UsersService (tìm user lúc login).
  exports: [UsersService],
})
export class UsersModule {}
