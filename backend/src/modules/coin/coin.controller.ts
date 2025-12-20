import { Controller, Get, Post, Body, Query, ParseIntPipe } from '@nestjs/common';
import { CoinService } from './coin.service';

@Controller('coins')
export class CoinController {
  constructor(private coinService: CoinService) {}

  @Get('balance')
  async getBalance() {
    // TODO: 从JWT获取userId
    const userId = BigInt(1);
    return this.coinService.getBalance(userId);
  }

  @Get('transactions')
  async getTransactions(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 20,
    @Query('type') type?: string,
  ) {
    // TODO: 从JWT获取userId
    const userId = BigInt(1);
    return this.coinService.getTransactions(userId, page, pageSize, type);
  }

  @Post('recharge')
  async recharge(@Body('amount', ParseIntPipe) amount: number) {
    // TODO: 从JWT获取userId
    const userId = BigInt(1);
    return this.coinService.recharge(userId, amount);
  }
}

