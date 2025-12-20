import { Module } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { StatisticsService } from './statistics.service'
import { StatisticsController } from './statistics.controller'

@Module({
  providers: [PrismaService, StatisticsService],
  controllers: [StatisticsController],
  exports: [StatisticsService],
})
export class StatisticsModule {}

