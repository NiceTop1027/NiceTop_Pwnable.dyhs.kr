import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { LecturesService } from './lectures.service';

@Controller('lectures')
export class LecturesController {
  constructor(private readonly lecturesService: LecturesService) {}

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

  @Public()
  @Get(':slug')
  getLecture(@Param('slug') slug: string) {
    return this.lecturesService.getLectureBySlug(slug);
  }
}