import { BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import {
  detectImageType,
  extensionForImageType,
  mimeForImageType,
  type DetectedImageType,
} from './image-bytes';

const MAX_DIMENSION = 4096;
const MAX_OUTPUT_BYTES = 5 * 1024 * 1024;

export type SanitizedImage = {
  buffer: Buffer;
  type: DetectedImageType;
  extension: string;
  mime: string;
};

export async function sanitizeImageBuffer(
  input: Buffer,
  maxOutputBytes = MAX_OUTPUT_BYTES,
): Promise<SanitizedImage> {
  const detected = detectImageType(input);
  if (!detected) {
    throw new BadRequestException('Only JPEG, PNG, WebP, and GIF are allowed');
  }

  let pipeline = sharp(input, { failOn: 'error', animated: false });
  const metadata = await pipeline.metadata();

  if ((metadata.width ?? 0) > MAX_DIMENSION || (metadata.height ?? 0) > MAX_DIMENSION) {
    throw new BadRequestException('Image dimensions are too large');
  }

  if (detected === 'jpeg') {
    pipeline = pipeline.jpeg({ quality: 85, mozjpeg: true });
  } else if (detected === 'png') {
    pipeline = pipeline.png({ compressionLevel: 9, force: true });
  } else if (detected === 'webp') {
    pipeline = pipeline.webp({ quality: 85, force: true });
  } else {
    pipeline = pipeline.gif();
  }

  const buffer = await pipeline.toBuffer();
  if (buffer.length > maxOutputBytes) {
    throw new BadRequestException('Processed image is too large');
  }

  return {
    buffer,
    type: detected,
    extension: extensionForImageType(detected),
    mime: mimeForImageType(detected),
  };
}