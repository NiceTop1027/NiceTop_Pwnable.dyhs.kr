import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get('ranking')
  getRanking(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.usersService.getRanking(parsedLimit);
  }

  @Public()
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}