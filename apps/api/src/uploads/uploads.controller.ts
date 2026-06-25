import {
  Controller,
  Get,
  Header,
  Param,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { RateLimit } from '../common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { UploadsService } from './uploads.service';

@Controller('uploads')
@UseGuards(RateLimitGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Public()
  @RateLimit(120, 60_000)
  @Get('avatars/:filename')
  @Header('Cache-Control', 'public, max-age=3600')
  async getAvatar(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return this.uploadsService.open('avatars', filename);
  }

  @Public()
  @RateLimit(240, 60_000)
  @Get('content/:filename')
  @Header('Cache-Control', 'public, max-age=86400, immutable')
  async getContent(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return this.uploadsService.open('content', filename);
  }
}