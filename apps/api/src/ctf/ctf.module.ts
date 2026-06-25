import { Module } from '@nestjs/common';
import { CtfController } from './ctf.controller';
import { CtfService } from './ctf.service';

@Module({
  controllers: [CtfController],
  providers: [CtfService],
})
export class CtfModule {}