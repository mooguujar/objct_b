import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CoinService {
  constructor(private prisma: PrismaService) {}

  async getBalance(userId: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { coinBalance: true },
    });
    return { balance: user?.coinBalance || 0 };
  }

  async getTransactions(userId: bigint, page = 1, pageSize = 20, type?: string) {
    const skip = (page - 1) * pageSize;
    const where: any = { userId };
    if (type) {
      where.type = type;
    }

    const [list, total] = await Promise.all([
      this.prisma.coinTransaction.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.coinTransaction.count({ where }),
    ]);

    return {
      list,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async recharge(userId: bigint, amount: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    const newBalance = Number(user.coinBalance) + amount;

    // 更新余额
    await this.prisma.user.update({
      where: { id: userId },
      data: { coinBalance: newBalance },
    });

    // 创建交易记录
    const transaction = await this.prisma.coinTransaction.create({
      data: {
        userId,
        type: 'recharge',
        amount,
        balance: newBalance,
        description: `充值${amount}金币`,
      },
    });

    return {
      orderId: transaction.id.toString(),
      balance: newBalance,
    };
  }
}

