import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  Ip,
} from '@nestjs/common'
import { StatisticsService } from './statistics.service'
import {
  BatchReportPageViewDto,
  ReportPageViewDto,
} from './dto/report-page-view.dto'
import {
  BatchReportClickEventDto,
  ReportClickEventDto,
} from './dto/report-click-event.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Post('page-view')
  async reportPageView(
    @Body() dto: ReportPageViewDto,
    @Request() req: any,
    @Ip() ip: string,
  ) {
    const userId = req.user?.id ? BigInt(req.user.id) : null
    return this.statisticsService.reportPageView({
      ...dto,
      userId,
      ipAddress: ip,
      userAgent: req.headers['user-agent'],
    })
  }

  @Post('click-event')
  async reportClickEvent(
    @Body() dto: ReportClickEventDto,
    @Request() req: any,
    @Ip() ip: string,
  ) {
    const userId = req.user?.id ? BigInt(req.user.id) : null
    return this.statisticsService.reportClickEvent({
      ...dto,
      userId,
      relatedId: dto.relatedId ? BigInt(dto.relatedId) : null,
      ipAddress: ip,
    })
  }

  @Post('page-view/batch')
  async batchReportPageView(
    @Body() dto: BatchReportPageViewDto,
    @Request() req: any,
    @Ip() ip: string,
  ) {
    const userId = req.user?.id ? BigInt(req.user.id) : null
    const pageViews = dto.pageViews.map((pv) => ({
      ...pv,
      userId: userId ? userId.toString() : null,
      ipAddress: ip,
      userAgent: req.headers['user-agent'],
    }))
    return this.statisticsService.batchReportPageView(pageViews)
  }

  @Post('click-event/batch')
  async batchReportClickEvent(
    @Body() dto: BatchReportClickEventDto,
    @Request() req: any,
    @Ip() ip: string,
  ) {
    const userId = req.user?.id ? BigInt(req.user.id) : null
    const clickEvents = dto.clickEvents.map((ce) => ({
      ...ce,
      userId: userId ? userId.toString() : null,
      relatedId: ce.relatedId ? ce.relatedId.toString() : null,
      ipAddress: ip,
    }))
    return this.statisticsService.batchReportClickEvent(clickEvents)
  }

  @Get('page-view/stats')
  @UseGuards(JwtAuthGuard)
  async getPageViewStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('pagePath') pagePath?: string,
    @Query('platform') platform?: string,
  ) {
    return this.statisticsService.getPageViewStats({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      pagePath,
      platform,
    })
  }

  @Get('click-event/stats')
  @UseGuards(JwtAuthGuard)
  async getClickEventStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('eventType') eventType?: string,
    @Query('pagePath') pagePath?: string,
  ) {
    return this.statisticsService.getClickEventStats({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      eventType,
      pagePath,
    })
  }

  @Get('user-behavior/path')
  @UseGuards(JwtAuthGuard)
  async getUserBehaviorPath(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userId = BigInt(req.user.id)
    return this.statisticsService.getUserBehaviorPath(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    )
  }
}

