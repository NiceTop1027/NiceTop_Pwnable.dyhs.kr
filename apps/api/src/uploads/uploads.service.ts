import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { extname, join } from 'path';
import { detectImageType, mimeForImageType } from '../common/utils/image-bytes';
import { PrismaService } from '../prisma/prisma.service';

const UPLOAD_ROOT = join(process.cwd(), 'uploads');
const ALLOWED_CATEGORIES = new Set(['avatars', 'content']);
const SAFE_FILENAME = /^[a-zA-Z0-9._-]+$/;

@Injectable()
export class UploadsService {
  constructor(private readonly prisma: PrismaService) {}

  resolveFile(category: string, filename: string) {
    if (!ALLOWED_CATEGORIES.has(category)) {
      throw new NotFoundException('File not found');
    }

    if (!filename || filename.includes('..') || !SAFE_FILENAME.test(filename)) {
      throw new NotFoundException('File not found');
    }

    const filepath = join(UPLOAD_ROOT, category, filename);
    if (!filepath.startsWith(join(UPLOAD_ROOT, category))) {
      throw new NotFoundException('File not found');
    }

    if (!existsSync(filepath)) {
      throw new NotFoundException('File not found');
    }

    return filepath;
  }

  async open(category: string, filename: string) {
    const filepath = this.resolveFile(category, filename);
    const stream = createReadStream(filepath, { start: 0, end: 15 });
    const bytes = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });

    const detected = detectImageType(bytes);
    const mime = detected
      ? mimeForImageType(detected)
      : this.getMimeForExtension(filename);

    let effectiveFilename = filename;
    if (category === 'content') {
      const attachment = await this.prisma.challengeAttachment.findFirst({
        where: { storageKey: filename },
        select: { filename: true },
      });
      if (attachment) {
        effectiveFilename = attachment.filename;
      }
    }

    const disposition =
      category === 'avatars'
        ? `inline; filename="${effectiveFilename}"`
        : `attachment; filename="${effectiveFilename}"`;

    return new StreamableFile(createReadStream(filepath), {
      type: mime,
      disposition,
    });
  }

  private getMimeForExtension(filename: string) {
    const extension = extname(filename).toLowerCase();
    switch (extension) {
      case '.pdf':
        return 'application/pdf';
      case '.txt':
        return 'text/plain';
      case '.md':
        return 'text/markdown';
      case '.json':
        return 'application/json';
      case '.csv':
        return 'text/csv';
      case '.zip':
        return 'application/zip';
      case '.doc':
        return 'application/msword';
      case '.docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case '.ppt':
        return 'application/vnd.ms-powerpoint';
      case '.pptx':
        return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      case '.xls':
        return 'application/vnd.ms-excel';
      case '.xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'application/octet-stream';
    }
  }
}