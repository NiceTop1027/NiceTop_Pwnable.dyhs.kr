import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { ChallengesController } from './challenges.controller';
import { ChallengesService } from './challenges.service';
import { ContainerService } from './container.service';
import { ChallengeDockerService } from './challenge-docker.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, ConfigModule],
  controllers: [ChallengesController],
  providers: [ChallengesService, ContainerService, ChallengeDockerService],
  exports: [ChallengeDockerService],
})
export class ChallengesModule {}