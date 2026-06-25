import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ChallengeCategory } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ChallengesService } from './challenges.service';
import { SubmitFlagDto } from './dto/submit-flag.dto';

@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

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
}