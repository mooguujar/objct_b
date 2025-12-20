import { Module } from '@nestjs/common';
import { CreatorService } from './creator.service';
import { CreatorController } from './creator.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [CreatorController],
  providers: [CreatorService, PrismaService],
  exports: [CreatorService],
})
export class CreatorModule {}

