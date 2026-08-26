import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ArticlesService } from './articles.service';
import { TagsResponseDto } from './dto/tags-response.dto';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly articlesService: ArticlesService) {}

  // GET /api/tags
  //
  // @Public: danh sách tag là dữ liệu công khai, dùng để dựng bộ lọc trên
  // giao diện trước cả khi người dùng đăng nhập.
  @Public()
  @ApiOperation({ summary: 'Danh sách toàn bộ tag' })
  @ApiOkResponse({ type: TagsResponseDto })
  @Get()
  async list(): Promise<TagsResponseDto> {
    return { tags: await this.articlesService.listTagNames() };
  }
}
