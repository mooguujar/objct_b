import { Module, forwardRef } from '@nestjs/common';
import { CoinService } from './coin.service';
import { CoinController } from './coin.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [CoinController],
  providers: [CoinService, PrismaService],
  exports: [CoinService],
})
export class CoinModule {}

