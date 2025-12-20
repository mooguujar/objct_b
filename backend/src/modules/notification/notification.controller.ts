import { Controller, Get, Put, Delete, Param, Query, ParseIntPipe } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 20,
    @Query('type') type?: string,
    @Query('isRead') isRead?: string,
  ) {
    // TODO: 从JWT获取userId
    const userId = BigInt(1);
    return this.notificationService.findAll(userId, page, pageSize, {
      type,
      isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.findOne(BigInt(id));
  }

  @Put(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.markAsRead(BigInt(id));
  }

  @Delete()
  async clearAll() {
    // TODO: 从JWT获取userId
    const userId = BigInt(1);
    return this.notificationService.clearAll(userId);
  }
}

