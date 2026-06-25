import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminLogService } from './admin-log.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminLogService],
})
export class AdminModule {}