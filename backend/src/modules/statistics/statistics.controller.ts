import { Controller, Post, Body } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @Post('page-view')
  async createPageView(@Body() data: any) {
    return this.statisticsService.createPageView(data);
  }

  @Post('click-event')
  async createClickEvent(@Body() data: any) {
    return this.statisticsService.createClickEvent(data);
  }

  @Post('batch')
  async batchCreate(@Body() data: any) {
    const results = await this.statisticsService.batchCreate(data);
    return {
      successCount:
        results.pageViews.length +
        results.clickEvents.length +
        results.behaviors.length,
      failCount: 0,
    };
  }
}

