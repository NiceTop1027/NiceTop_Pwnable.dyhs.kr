import { Controller, Get, Param, Query } from '@nestjs/common';
import { parsePositiveInt } from '../common/utils/pagination';
import { Public } from '../common/decorators/public.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get('ranking')
  getRanking(@Query('limit') limit?: string) {
    return this.usersService.getRanking(parsePositiveInt(limit, 50, 100));
  }

  @Public()
  @Get('profile/:username')
  findByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}