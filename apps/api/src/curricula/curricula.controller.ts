import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { CurriculaService } from './curricula.service';

@Controller('curricula')
export class CurriculaController {
  constructor(private readonly curriculaService: CurriculaService) {}

  @Public()
  @Get()
  getAll() {
    return this.curriculaService.getAll();
  }

  @Public()
  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.curriculaService.getBySlug(slug);
  }
}