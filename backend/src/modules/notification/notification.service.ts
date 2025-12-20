import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: bigint, page = 1, pageSize = 20, filters?: any) {
    const skip = (page - 1) * pageSize;
    const where: any = { userId };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.isRead !== undefined) {
      where.isRead = filters.isRead;
    }

    const [list, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    const unreadCount = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return {
      list,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      unreadCount,
    };
  }

  async findOne(id: bigint) {
    return this.prisma.notification.findUnique({
      where: { id },
    });
  }

  async markAsRead(id: bigint) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async clearAll(userId: bigint) {
    return this.prisma.notification.deleteMany({
      where: { userId },
    });
  }
}

