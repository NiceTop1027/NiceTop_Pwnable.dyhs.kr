import { Controller, Get, Param, Post } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Public()
  @Get('recent')
  getRecentPublic() {
    return this.notificationsService.getRecentPublic();
  }

  @Get()
  getForUser(@CurrentUser() user: { id: string }) {
    return this.notificationsService.getForUser(user.id);
  }

  @Post('read-all')
  markAllRead(@CurrentUser() user: { id: string }) {
    return this.notificationsService.markAllRead(user.id);
  }

  @Post('read/:noticeId')
  markNoticeRead(
    @CurrentUser() user: { id: string },
    @Param('noticeId') noticeId: string,
  ) {
    return this.notificationsService.markNoticeRead(user.id, noticeId);
  }
}