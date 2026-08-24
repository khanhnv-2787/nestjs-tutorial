import { createReadStream } from 'node:fs';
import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BEARER_AUTH_NAME } from '../../config/swagger.config';
import { AttachmentsService } from './attachments.service';

@ApiTags('attachments')
@ApiBearerAuth(BEARER_AUTH_NAME)
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  // GET /api/attachments/:id
  //
  // KHÔNG @Public, KHÔNG @OptionalAuth -> guard toàn cục bắt buộc token.
  // Đây chính là điểm khác biệt của hướng "private": file không nằm trong
  // thư mục tĩnh, muốn lấy phải đi qua đây và phải đăng nhập.
  @ApiOperation({
    summary: 'Tải file đính kèm',
    description: 'Bắt buộc đăng nhập. File không truy cập được bằng URL tĩnh.',
  })
  @ApiProduces('application/octet-stream')
  @ApiNotFoundResponse({ description: 'Không tìm thấy file' })
  @ApiUnauthorizedResponse({
    description: 'Thiếu token hoặc token không hợp lệ',
  })
  @Get(':id')
  async download(
    // ParseUUIDPipe chặn id sai định dạng ngay ở cửa, khỏi phải xuống DB.
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StreamableFile> {
    const attachment = await this.attachmentsService.findById(id);
    const path = this.attachmentsService.getAbsolutePath(attachment);

    // StreamableFile: Nest tự pipe stream vào response, không nạp cả file
    // vào RAM. Với ảnh vài MB thì chưa khác biệt, nhưng là thói quen đúng.
    return new StreamableFile(createReadStream(path), {
      type: attachment.fileType,
      // inline -> trình duyệt hiển thị thay vì tải xuống.
      disposition: `inline; filename="${encodeURIComponent(attachment.fileName)}"`,
      length: attachment.fileSize,
    });
  }
}
