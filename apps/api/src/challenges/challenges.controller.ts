import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { ChallengeCategory } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ChallengesService } from './challenges.service';
import { ContainerService } from './container.service';
import { SubmitFlagDto } from './dto/submit-flag.dto';

@Controller('challenges')
export class ChallengesController {
  constructor(
    private readonly challengesService: ChallengesService,
    private readonly containerService: ContainerService,
  ) {}

  @Public()
  @Get('categories')
  getCategories() {
    return this.challengesService.getCategories();
  }

  @Public()
  @Get()
  getChallenges(@Query('category') category?: ChallengeCategory) {
    return this.challengesService.getChallenges(category);
  }

  @Public()
  @Get(':slug/files/download')
  async downloadPublicFile(
    @Param('slug') slug: string,
    @Query('path') path: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const buffer = await this.challengesService.getPublicFile(slug, path);
    const filename = path.split('/').pop() ?? 'download';
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(buffer);
  }

  @Public()
  @Get(':slug')
  getChallenge(
    @Param('slug') slug: string,
    @CurrentUser() user?: { id: string },
  ) {
    return this.challengesService.getChallengeBySlug(slug, user?.id);
  }

  @Post(':slug/submit')
  submitFlag(
    @Param('slug') slug: string,
    @CurrentUser() user: { id: string },
    @Body() dto: SubmitFlagDto,
  ) {
    return this.challengesService.submitFlag(slug, user.id, dto.flag);
  }

  /**
   * 새로운 인스턴스 시작 (Docker 컨테이너 생성)
   */
  @Post(':id/instance/start')
  async startInstance(
    @Param('id') challengeId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.containerService.startInstance(user.id, challengeId);
  }

  /**
   * 인스턴스 정지 및 정리
   */
  @Delete(':id/instance/:instanceId')
  async stopInstance(
    @Param('id') _challengeId: string,
    @Param('instanceId') instanceId: string,
    @CurrentUser() user: { id: string },
  ) {
    await this.containerService.stopInstance(instanceId, user.id);
    return { message: 'Instance stopped' };
  }

  /**
   * 인스턴스 상태 조회
   */
  @Get(':id/instance/:instanceId')
  async getInstance(
    @Param('id') _challengeId: string,
    @Param('instanceId') instanceId: string,
  ) {
    return this.containerService.getInstance(instanceId);
  }
}