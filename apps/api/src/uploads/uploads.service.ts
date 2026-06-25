import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { detectImageType, mimeForImageType } from '../common/utils/image-bytes';

const UPLOAD_ROOT = join(process.cwd(), 'uploads');
const ALLOWED_CATEGORIES = new Set(['avatars', 'content']);
const SAFE_FILENAME = /^[a-zA-Z0-9._-]+$/;

@Injectable()
export class UploadsService {
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
    const mime = detected ? mimeForImageType(detected) : 'application/octet-stream';

    return new StreamableFile(createReadStream(filepath), {
      type: mime,
      disposition: `inline; filename="${filename}"`,
    });
  }
}