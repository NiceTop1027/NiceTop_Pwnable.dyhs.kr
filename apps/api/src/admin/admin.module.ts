import { Module } from '@nestjs/common';
import { ContactModule } from '../contact/contact.module';
import { ChallengesModule } from '../challenges/challenges.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminLogService } from './admin-log.service';

@Module({
  imports: [ContactModule, ChallengesModule],
  controllers: [AdminController],
  providers: [AdminService, AdminLogService],
})
export class AdminModule {}