import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { CtfService } from './ctf.service';

@Controller('ctf')
export class CtfController {
  constructor(private readonly ctfService: CtfService) {}

  @Public()
  @Get()
  getUpcoming() {
    return this.ctfService.getUpcoming();
  }

  @Public()
  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.ctfService.getBySlug(slug);
  }
}