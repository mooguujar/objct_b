import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async createPageView(data: any) {
    return this.prisma.pageView.create({
      data: {
        userId: data.userId || null,
        pagePath: data.pagePath,
        pageTitle: data.pageTitle,
        deviceType: data.deviceType,
        platform: data.platform,
        referrer: data.referrer,
        stayDuration: data.stayDuration,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async createClickEvent(data: any) {
    return this.prisma.clickEvent.create({
      data: {
        userId: data.userId || null,
        eventType: data.eventType,
        elementId: data.elementId,
        elementType: data.elementType,
        pagePath: data.pagePath,
        clickPositionX: data.clickPositionX,
        clickPositionY: data.clickPositionY,
        relatedId: data.relatedId,
        relatedType: data.relatedType,
        ipAddress: data.ipAddress,
      },
    });
  }

  async createUserBehavior(data: any) {
    return this.prisma.userBehavior.create({
      data: {
        userId: data.userId || null,
        behaviorType: data.behaviorType,
        targetType: data.targetType,
        targetId: data.targetId,
        pagePath: data.pagePath,
        deviceInfo: data.deviceInfo,
        ipAddress: data.ipAddress,
      },
    });
  }

  async batchCreate(data: {
    pageViews?: any[];
    clickEvents?: any[];
    behaviors?: any[];
  }) {
    const results = {
      pageViews: [] as any[],
      clickEvents: [] as any[],
      behaviors: [] as any[],
    };

    if (data.pageViews?.length) {
      for (const item of data.pageViews) {
        try {
          const result = await this.createPageView(item);
          results.pageViews.push(result);
        } catch (error) {
          console.error('Failed to create page view:', error);
        }
      }
    }

    if (data.clickEvents?.length) {
      for (const item of data.clickEvents) {
        try {
          const result = await this.createClickEvent(item);
          results.clickEvents.push(result);
        } catch (error) {
          console.error('Failed to create click event:', error);
        }
      }
    }

    if (data.behaviors?.length) {
      for (const item of data.behaviors) {
        try {
          const result = await this.createUserBehavior(item);
          results.behaviors.push(result);
        } catch (error) {
          console.error('Failed to create user behavior:', error);
        }
      }
    }

    return results;
  }
}

