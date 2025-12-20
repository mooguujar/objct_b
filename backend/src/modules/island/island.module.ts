import { Module, forwardRef } from '@nestjs/common';
import { IslandService } from './island.service';
import { IslandController } from './island.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { CoinModule } from '../coin/coin.module';

@Module({
  imports: [forwardRef(() => CoinModule)],
  controllers: [IslandController],
  providers: [IslandService, PrismaService],
  exports: [IslandService],
})
export class IslandModule {}

