import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CoinService } from './coin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RechargeDto } from './dto/recharge.dto';

@Controller('coins')
@UseGuards(JwtAuthGuard)
export class CoinController {
  constructor(private readonly coinService: CoinService) {}

  @Get('balance')
  async getBalance(@Request() req: any) {
    const userId = BigInt(req.user.id);
    const result = await this.coinService.getBalance(userId);
    return {
      code: 200,
      message: 'success',
      data: result,
    };
  }

  @Get('transactions')
  async getTransactions(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('type') type?: string,
    @Request() req?: any,
  ) {
    const userId = BigInt(req.user.id);
    const result = await this.coinService.getTransactions(userId, {
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
      type,
    });
    return {
      code: 200,
      message: 'success',
      data: result,
    };
  }

  @Post('recharge')
  @HttpCode(HttpStatus.OK)
  async recharge(@Body() rechargeDto: RechargeDto, @Request() req: any) {
    const userId = BigInt(req.user.id);
    const result = await this.coinService.recharge(
      userId,
      rechargeDto.amount,
      rechargeDto.paymentMethod,
    );
    return {
      code: 200,
      message: '充值成功',
      data: result,
    };
  }
}

