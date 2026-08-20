import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // GET /api
  @ApiOperation({
    summary: 'Kiểm tra service còn sống',
    description:
      'Endpoint hello world, dùng để xác nhận app đã khởi động và nhận request.',
  })
  @ApiOkResponse({
    description: 'Service đang hoạt động',
    schema: { type: 'string', example: 'Hello World!' },
  })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
