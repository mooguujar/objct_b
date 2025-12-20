import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CreatorService {
  constructor(private prisma: PrismaService) {}

  async apply(userId: bigint, data: any) {
    // 检查是否已有申请
    const existing = await this.prisma.creatorApplication.findFirst({
      where: { userId, status: 'pending' },
    });

    if (existing) {
      throw new Error('已有待审核的申请');
    }

    const application = await this.prisma.creatorApplication.create({
      data: {
        userId,
        realName: data.realName,
        phone: data.phone,
        email: data.email,
        bio: data.bio,
        qualificationUrls: data.qualificationUrls,
      },
    });

    return application;
  }

  async getStatus(userId: bigint) {
    const application = await this.prisma.creatorApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return application || null;
  }
}

