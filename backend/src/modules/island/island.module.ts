import { Module } from '@nestjs/common';
import { IslandService } from './island.service';
import { IslandController } from './island.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [IslandController],
  providers: [IslandService, PrismaService],
  exports: [IslandService],
})
export class IslandModule {}

