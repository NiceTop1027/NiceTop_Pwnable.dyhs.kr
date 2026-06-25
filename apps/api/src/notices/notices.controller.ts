import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { NoticesService } from './notices.service';

@Controller('notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Public()
  @Get()
  getAll() {
    return this.noticesService.getAll();
  }

  @Public()
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.noticesService.getById(id);
  }
}