import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { Prisma } from '@prisma/client'

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  // 上报页面访问
  async reportPageView(data: {
    userId?: bigint | null
    pagePath: string
    pageTitle?: string
    deviceType?: string
    platform?: string
    referrer?: string
    stayDuration?: number
    ipAddress?: string
    userAgent?: string
  }) {
    return this.prisma.pageView.create({
      data: {
        userId: data.userId ? BigInt(data.userId.toString()) : null,
        pagePath: data.pagePath,
        pageTitle: data.pageTitle,
        deviceType: data.deviceType,
        platform: data.platform,
        referrer: data.referrer,
        stayDuration: data.stayDuration,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    })
  }

  // 批量上报页面访问
  async batchReportPageView(pageViews: any[]) {
    const data = pageViews.map((pv) => ({
      userId: pv.userId ? BigInt(pv.userId.toString()) : null,
      pagePath: pv.pagePath,
      pageTitle: pv.pageTitle,
      deviceType: pv.deviceType,
      platform: pv.platform,
      referrer: pv.referrer,
      stayDuration: pv.stayDuration,
      ipAddress: pv.ipAddress,
      userAgent: pv.userAgent,
    }))

    return this.prisma.pageView.createMany({
      data,
      skipDuplicates: true,
    })
  }

  // 上报点击事件
  async reportClickEvent(data: {
    userId?: bigint | null
    eventType: string
    elementId?: string
    elementType?: string
    pagePath: string
    clickPositionX?: number
    clickPositionY?: number
    relatedId?: bigint | null
    relatedType?: string
    ipAddress?: string
  }) {
    return this.prisma.clickEvent.create({
      data: {
        userId: data.userId ? BigInt(data.userId.toString()) : null,
        eventType: data.eventType,
        elementId: data.elementId,
        elementType: data.elementType,
        pagePath: data.pagePath,
        clickPositionX: data.clickPositionX,
        clickPositionY: data.clickPositionY,
        relatedId: data.relatedId ? BigInt(data.relatedId.toString()) : null,
        relatedType: data.relatedType,
        ipAddress: data.ipAddress,
      },
    })
  }

  // 批量上报点击事件
  async batchReportClickEvent(clickEvents: any[]) {
    const data = clickEvents.map((ce) => ({
      userId: ce.userId ? BigInt(ce.userId.toString()) : null,
      eventType: ce.eventType,
      elementId: ce.elementId,
      elementType: ce.elementType,
      pagePath: ce.pagePath,
      clickPositionX: ce.clickPositionX,
      clickPositionY: ce.clickPositionY,
      relatedId: ce.relatedId ? BigInt(ce.relatedId.toString()) : null,
      relatedType: ce.relatedType,
      ipAddress: ce.ipAddress,
    }))

    return this.prisma.clickEvent.createMany({
      data,
      skipDuplicates: true,
    })
  }

  // 获取页面访问统计
  async getPageViewStats(params: {
    startDate?: Date
    endDate?: Date
    pagePath?: string
    platform?: string
  }) {
    const where: Prisma.PageViewWhereInput = {}
    if (params.startDate || params.endDate) {
      where.createdAt = {}
      if (params.startDate) where.createdAt.gte = params.startDate
      if (params.endDate) where.createdAt.lte = params.endDate
    }
    if (params.pagePath) where.pagePath = params.pagePath
    if (params.platform) where.platform = params.platform

    const [total, byPath, byPlatform, byDate] = await Promise.all([
      this.prisma.pageView.count({ where }),
      this.prisma.pageView.groupBy({
        by: ['pagePath'],
        where,
        _count: { pagePath: true },
        orderBy: { _count: { pagePath: 'desc' } },
        take: 10,
      }),
      this.prisma.pageView.groupBy({
        by: ['platform'],
        where,
        _count: { platform: true },
      }),
      this.prisma.pageView.groupBy({
        by: ['createdAt'],
        where,
        _count: { createdAt: true },
      }),
    ])

    const avgStayDuration = await this.prisma.pageView.aggregate({
      where: { ...where, stayDuration: { not: null } },
      _avg: { stayDuration: true },
    })

    return {
      total,
      avgStayDuration: avgStayDuration._avg.stayDuration || 0,
      byPath: byPath.map((item) => ({
        pagePath: item.pagePath,
        count: item._count.pagePath,
      })),
      byPlatform: byPlatform.map((item) => ({
        platform: item.platform,
        count: item._count.platform,
      })),
      byDate,
    }
  }

  // 获取点击事件统计
  async getClickEventStats(params: {
    startDate?: Date
    endDate?: Date
    eventType?: string
    pagePath?: string
  }) {
    const where: Prisma.ClickEventWhereInput = {}
    if (params.startDate || params.endDate) {
      where.createdAt = {}
      if (params.startDate) where.createdAt.gte = params.startDate
      if (params.endDate) where.createdAt.lte = params.endDate
    }
    if (params.eventType) where.eventType = params.eventType
    if (params.pagePath) where.pagePath = params.pagePath

    const [total, byEventType, byElementId, hotmap] = await Promise.all([
      this.prisma.clickEvent.count({ where }),
      this.prisma.clickEvent.groupBy({
        by: ['eventType'],
        where,
        _count: { eventType: true },
        orderBy: { _count: { eventType: 'desc' } },
      }),
      this.prisma.clickEvent.groupBy({
        by: ['elementId'],
        where,
        _count: { elementId: true },
        orderBy: { _count: { elementId: 'desc' } },
        take: 20,
      }),
      this.prisma.clickEvent.findMany({
        where: {
          ...where,
          clickPositionX: { not: null },
          clickPositionY: { not: null },
        },
        select: {
          clickPositionX: true,
          clickPositionY: true,
          pagePath: true,
        },
        take: 1000,
      }),
    ])

    return {
      total,
      byEventType: byEventType.map((item) => ({
        eventType: item.eventType,
        count: item._count.eventType,
      })),
      byElementId: byElementId.map((item) => ({
        elementId: item.elementId,
        count: item._count.elementId,
      })),
      hotmap: hotmap.map((item) => ({
        x: item.clickPositionX,
        y: item.clickPositionY,
        pagePath: item.pagePath,
      })),
    }
  }

  // 用户行为路径分析
  async getUserBehaviorPath(userId: bigint, startDate?: Date, endDate?: Date) {
    const where: Prisma.PageViewWhereInput = {
      userId,
    }
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = startDate
      if (endDate) where.createdAt.lte = endDate
    }

    const pageViews = await this.prisma.pageView.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      select: {
        pagePath: true,
        pageTitle: true,
        createdAt: true,
        stayDuration: true,
      },
    })

    return pageViews
  }
}

