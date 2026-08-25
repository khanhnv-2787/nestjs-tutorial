import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OptionalAuth } from '../../common/decorators/optional-auth.decorator';
import { BEARER_AUTH_NAME } from '../../config/swagger.config';
import { User } from '../users/entities/user.entity';
import {
  toProfileResponse,
  type ProfileResponseDto,
} from './dto/profile-response.dto';
import { ProfilesService } from './profiles.service';

@ApiTags('profiles')
@ApiBearerAuth(BEARER_AUTH_NAME)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  // GET /api/profiles/:username
  //
  // @OptionalAuth: khách chưa đăng nhập vẫn xem được profile (following luôn
  // false), user đã đăng nhập thì thấy following đúng thực tế.
  @OptionalAuth()
  @ApiOperation({
    summary: 'Xem profile của một user',
    description:
      'Không cần đăng nhập. Nếu có token hợp lệ, field `following` phản ánh quan hệ thật.',
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy user' })
  @Get(':username')
  async getProfile(
    @Param('username') username: string,
    // Khách vãng lai -> undefined. Vì vậy kiểu phải là `User | undefined`.
    @CurrentUser() viewer: User | undefined,
  ): Promise<ProfileResponseDto> {
    const { user, following } = await this.profilesService.getProfile(
      username,
      viewer,
    );
    return toProfileResponse(user, following);
  }

  // POST /api/profiles/:username/follow
  // KHÔNG @OptionalAuth -> bắt buộc đăng nhập, guard toàn cục lo phần này.
  @ApiOperation({
    summary: 'Follow một user',
    description: 'Idempotent — follow lại người đã follow vẫn trả 200.',
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy user' })
  @ApiBadRequestResponse({ description: 'Không thể tự follow chính mình' })
  @ApiUnauthorizedResponse({
    description: 'Thiếu token hoặc token không hợp lệ',
  })
  // 200 thay vì 201: không tạo ra tài nguyên có URL riêng, và trả về profile.
  @HttpCode(HttpStatus.OK)
  @Post(':username/follow')
  async follow(
    @Param('username') username: string,
    @CurrentUser() follower: User,
  ): Promise<ProfileResponseDto> {
    const { user, following } = await this.profilesService.follow(
      follower,
      username,
    );
    return toProfileResponse(user, following);
  }

  // DELETE /api/profiles/:username/follow
  @ApiOperation({
    summary: 'Unfollow một user',
    description: 'Idempotent — unfollow người chưa follow vẫn trả 200.',
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy user' })
  @ApiBadRequestResponse({ description: 'Không thể tự unfollow chính mình' })
  @ApiUnauthorizedResponse({
    description: 'Thiếu token hoặc token không hợp lệ',
  })
  @Delete(':username/follow')
  async unfollow(
    @Param('username') username: string,
    @CurrentUser() follower: User,
  ): Promise<ProfileResponseDto> {
    const { user, following } = await this.profilesService.unfollow(
      follower,
      username,
    );
    return toProfileResponse(user, following);
  }
}
