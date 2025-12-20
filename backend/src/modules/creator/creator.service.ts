import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CreatorService {
  constructor(private prisma: PrismaService) {}

  // 提交申请
  async createApplication(userId: bigint, data: {
    realName?: string;
    phone?: string;
    email?: string;
    bio?: string;
    qualificationUrls?: string[];
  }) {
    // 检查是否已有申请
    const existing = await this.prisma.creatorApplication.findUnique({
      where: { userId },
    });

    if (existing) {
      if (existing.status === 'pending') {
        throw new BadRequestException('您已提交申请，请等待审核');
      }
      if (existing.status === 'approved') {
        throw new BadRequestException('您已经是创作者');
      }
      // 如果之前被拒绝，可以重新申请
    }

    // 创建或更新申请
    const application = await this.prisma.creatorApplication.upsert({
      where: { userId },
      create: {
        userId,
        realName: data.realName,
        phone: data.phone,
        email: data.email,
        bio: data.bio,
        qualificationUrls: data.qualificationUrls as any,
        status: 'pending',
      },
      update: {
        realName: data.realName,
        phone: data.phone,
        email: data.email,
        bio: data.bio,
        qualificationUrls: data.qualificationUrls as any,
        status: 'pending',
        rejectReason: null,
        reviewedBy: null,
        reviewedAt: null,
      },
    });

    return {
      id: application.id,
      status: application.status,
      createdAt: application.createdAt,
    };
  }

  // 查询申请状态
  async getApplicationStatus(userId: bigint) {
    const application = await this.prisma.creatorApplication.findUnique({
      where: { userId },
      select: {
        id: true,
        status: true,
        rejectReason: true,
        createdAt: true,
        reviewedAt: true,
      },
    });

    if (!application) {
      return null;
    }

    return application;
  }
}

