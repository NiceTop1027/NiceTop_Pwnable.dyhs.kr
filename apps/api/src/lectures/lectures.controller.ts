import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { RecordLectureProgressDto } from './dto/record-lecture-progress.dto';
import { LecturesService } from './lectures.service';

@Controller('lectures')
export class LecturesController {
  constructor(private readonly lecturesService: LecturesService) {}

  @Get('learning/progress')
  listLearningProgress(@CurrentUser() user: { id: string }) {
    return this.lecturesService.listLearningProgress(user.id);
  }

  @Public()
  @Get('categories')
  getCategories() {
    return this.lecturesService.getCategories();
  }

  @Public()
  @Get()
  getLectures(@Query('category') category?: string) {
    return this.lecturesService.getLectures(category);
  }

  @Post(':slug/progress')
  recordProgress(
    @CurrentUser() user: { id: string },
    @Param('slug') slug: string,
    @Body() dto: RecordLectureProgressDto,
  ) {
    return this.lecturesService.recordPageProgress(
      user.id,
      slug,
      dto.pageSlug,
    );
  }

  @Get(':slug/:pageSlug')
  getLecturePage(
    @Param('slug') slug: string,
    @Param('pageSlug') pageSlug: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.lecturesService.getLectureBySlug(slug, pageSlug, user.id);
  }

  @Get(':slug')
  getLecture(
    @Param('slug') slug: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.lecturesService.getLectureBySlug(slug, undefined, user.id);
  }
}