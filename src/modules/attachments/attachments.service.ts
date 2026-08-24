import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import type { Env } from '../../config/env.validation';
import { Attachment, type AttachableType } from './entities/attachment.entity';

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);
  private readonly uploadDir: string;

  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    config: ConfigService<Env, true>,
    private readonly i18n: I18nService,
  ) {
    // resolve() ngay từ constructor -> mọi so sánh đường dẫn sau này đều
    // dựa trên đường dẫn tuyệt đối, không phụ thuộc cwd lúc chạy.
    this.uploadDir = resolve(config.get('UPLOAD_DIR', { infer: true }));
  }

  /**
   * Lưu file xuống đĩa và ghi một bản ghi attachment.
   *
   * Tên file trên đĩa dùng UUID, KHÔNG dùng tên gốc người dùng gửi lên —
   * tên gốc có thể chứa `../`, ký tự lạ, hoặc trùng nhau. Tên gốc chỉ được
   * lưu vào DB để trả lại đúng tên khi tải xuống.
   */
  async create(
    file: Express.Multer.File,
    attachableType: AttachableType,
    attachableId: number,
  ): Promise<Attachment> {
    const id = randomUUID();
    // Chia theo năm/tháng để một thư mục không phình lên hàng trăm nghìn file.
    const now = new Date();
    const folder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const relativePath = `${folder}/${id}${extname(file.originalname).toLowerCase()}`;
    const absolutePath = join(this.uploadDir, relativePath);

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, file.buffer);

    const attachment = this.attachmentRepository.create({
      id,
      attachableType,
      attachableId,
      path: relativePath,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
    });

    const saved = await this.attachmentRepository.save(attachment);
    this.logger.log(
      `Đã lưu attachment id=${saved.id} cho ${attachableType}#${attachableId} (${file.size} byte)`,
    );
    return saved;
  }

  async findById(id: string): Promise<Attachment> {
    const attachment = await this.attachmentRepository.findOne({
      where: { id },
    });
    if (!attachment) {
      throw new NotFoundException(this.i18n.t('attachment.not_found'));
    }
    return attachment;
  }

  /**
   * Đường dẫn tuyệt đối để đọc file.
   *
   * Kiểm tra kết quả có nằm TRONG uploadDir hay không — phòng path traversal
   * nếu cột `path` trong DB vì lý do nào đó chứa `../`. Dữ liệu trong DB cũng
   * không được tin tuyệt đối.
   */
  getAbsolutePath(attachment: Attachment): string {
    const absolute = resolve(join(this.uploadDir, normalize(attachment.path)));
    if (!absolute.startsWith(this.uploadDir + sep)) {
      throw new NotFoundException(this.i18n.t('attachment.not_found'));
    }
    return absolute;
  }

  /** Xoá mọi file cũ của một đối tượng — dùng khi thay avatar. */
  async removeAllFor(
    attachableType: AttachableType,
    attachableId: number,
  ): Promise<void> {
    const olds = await this.attachmentRepository.find({
      where: { attachableType, attachableId },
    });

    for (const old of olds) {
      try {
        await unlink(this.getAbsolutePath(old));
      } catch (error) {
        // File đã biến mất khỏi đĩa thì vẫn phải xoá bản ghi DB — không để
        // một lỗi dọn dẹp làm hỏng cả thao tác đổi avatar.
        this.logger.warn(
          `Không xoá được file của attachment id=${old.id}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    if (olds.length > 0) {
      await this.attachmentRepository.remove(olds);
      this.logger.log(
        `Đã xoá ${olds.length} attachment cũ của ${attachableType}#${attachableId}`,
      );
    }
  }
}
