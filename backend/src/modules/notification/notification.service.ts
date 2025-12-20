import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async getNotifications(
    userId: bigint,
    type?: string,
    page = 1,
    pageSize = 20,
  ) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: any = { userId };
    if (type) {
      where.type = type;
    }

    const total = await this.prisma.notification.count({ where });

    const notifications = await this.prisma.notification.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return {
      list: notifications.map((notif) => ({
        id: notif.id.toString(),
        type: notif.type,
        title: notif.title,
        content: notif.content,
        relatedId: notif.relatedId?.toString(),
        relatedType: notif.relatedType,
        isRead: notif.isRead,
        createdAt: notif.createdAt,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getNotificationById(id: bigint, userId: bigint) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('通知不存在');
    }

    // 标记为已读
    if (!notification.isRead) {
      await this.prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
    }

    return {
      id: notification.id.toString(),
      type: notification.type,
      title: notification.title,
      content: notification.content,
      relatedId: notification.relatedId?.toString(),
      relatedType: notification.relatedType,
      isRead: true,
      createdAt: notification.createdAt,
    };
  }

  async markAsRead(id: bigint, userId: bigint) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('通知不存在');
    }

    await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return { message: '标记成功' };
  }

  async markAllAsRead(userId: bigint) {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return { message: '全部标记成功' };
  }

  async clearNotifications(userId: bigint, type?: string) {
    const where: any = { userId };
    if (type) {
      where.type = type;
    }

    await this.prisma.notification.deleteMany({ where });

    return { message: '清除成功' };
  }

  async getUnreadCount(userId: bigint) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { count };
  }
}

