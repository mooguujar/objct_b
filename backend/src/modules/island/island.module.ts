import { Module } from '@nestjs/common';
import { IslandService } from './island.service';
import { IslandController } from './island.controller';

@Module({
  controllers: [IslandController],
  providers: [IslandService],
  exports: [IslandService],
})
export class IslandModule {}

