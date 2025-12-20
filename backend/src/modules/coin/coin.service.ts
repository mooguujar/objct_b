import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CoinService {
  constructor(private prisma: PrismaService) {}

  // 获取金币余额
  async getBalance(userId: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { coinBalance: true },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    return {
      balance: user.coinBalance || 0,
    };
  }

  // 获取交易记录
  async getTransactions(
    userId: bigint,
    options: {
      page?: number;
      pageSize?: number;
      type?: string;
    },
  ) {
    const { page = 1, pageSize = 20, type } = options;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: any = {
      userId,
    };

    if (type) {
      where.type = type;
    }

    const total = await this.prisma.coinTransaction.count({ where });

    const transactions = await this.prisma.coinTransaction.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const list = transactions.map((transaction) => ({
      id: transaction.id.toString(),
      type: transaction.type,
      amount: transaction.amount.toNumber(),
      balance: transaction.balance.toNumber(),
      description: transaction.description,
      createdAt: transaction.createdAt,
    }));

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

  // 金币充值
  async recharge(userId: bigint, amount: number, paymentMethod: string) {
    if (amount <= 0) {
      throw new BadRequestException('充值金额必须大于0');
    }

    // 获取用户当前余额
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { coinBalance: true },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    const currentBalance = user.coinBalance || 0;
    const newBalance = currentBalance + amount;

    // 创建交易记录
    const transaction = await this.prisma.coinTransaction.create({
      data: {
        userId,
        type: 'recharge',
        amount,
        balance: newBalance,
        description: `充值${amount}金币`,
        relatedType: paymentMethod,
      },
    });

    // 更新用户余额
    await this.prisma.user.update({
      where: { id: userId },
      data: { coinBalance: newBalance },
    });

    // 生成订单ID（实际应该调用支付接口生成订单）
    const orderId = `order_${Date.now()}_${transaction.id}`;
    // TODO: 实际应该调用支付接口获取支付URL
    const paymentUrl = `https://pay.example.com/pay?orderId=${orderId}&amount=${amount}&method=${paymentMethod}`;

    return {
      orderId,
      paymentUrl,
      balance: newBalance,
    };
  }

  // 金币消费
  async consume(
    userId: bigint,
    amount: number,
    description: string,
    metadata?: any,
  ) {
    if (amount <= 0) {
      throw new BadRequestException('消费金额必须大于0');
    }

    // 获取用户当前余额
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { coinBalance: true },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    const currentBalance = user.coinBalance || 0;

    if (currentBalance < amount) {
      throw new BadRequestException('金币余额不足');
    }

    const newBalance = currentBalance - amount;

    // 创建交易记录
    await this.prisma.coinTransaction.create({
      data: {
        userId,
        type: 'consume',
        amount: -amount,
        balance: newBalance,
        description,
        relatedId: metadata?.relatedId ? BigInt(metadata.relatedId) : null,
        relatedType: metadata?.relatedType || null,
      },
    });

    // 更新用户余额
    await this.prisma.user.update({
      where: { id: userId },
      data: { coinBalance: newBalance },
    });

    return {
      balance: newBalance,
    };
  }

  // 金币奖励
  async reward(
    userId: bigint,
    amount: number,
    description: string,
    metadata?: any,
  ) {
    if (amount <= 0) {
      throw new BadRequestException('奖励金额必须大于0');
    }

    // 获取用户当前余额
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { coinBalance: true },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    const currentBalance = user.coinBalance || 0;
    const newBalance = currentBalance + amount;

    // 创建交易记录
    await this.prisma.coinTransaction.create({
      data: {
        userId,
        type: 'reward',
        amount,
        balance: newBalance,
        description,
        relatedId: metadata?.relatedId ? BigInt(metadata.relatedId) : null,
        relatedType: metadata?.relatedType || null,
      },
    });

    // 更新用户余额
    await this.prisma.user.update({
      where: { id: userId },
      data: { coinBalance: newBalance },
    });

    return {
      balance: newBalance,
    };
  }

  // 金币退款
  async refund(
    userId: bigint,
    amount: number,
    description: string,
    metadata?: any,
  ) {
    if (amount <= 0) {
      throw new BadRequestException('退款金额必须大于0');
    }

    // 获取用户当前余额
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { coinBalance: true },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    const currentBalance = user.coinBalance || 0;
    const newBalance = currentBalance + amount;

    // 创建交易记录
    await this.prisma.coinTransaction.create({
      data: {
        userId,
        type: 'refund',
        amount,
        balance: newBalance,
        description,
        relatedId: metadata?.relatedId ? BigInt(metadata.relatedId) : null,
        relatedType: metadata?.relatedType || null,
      },
    });

    // 更新用户余额
    await this.prisma.user.update({
      where: { id: userId },
      data: { coinBalance: newBalance },
    });

    return {
      balance: newBalance,
    };
  }
}

