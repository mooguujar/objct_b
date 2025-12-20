import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(
    @Request() req: any,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const userId = BigInt(req.user.id);
    return this.notificationService.getNotifications(
      userId,
      type,
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 20,
    );
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const userId = BigInt(req.user.id);
    return this.notificationService.getUnreadCount(userId);
  }

  @Get(':id')
  async getNotificationById(@Param('id') id: string, @Request() req: any) {
    const userId = BigInt(req.user.id);
    const notificationId = BigInt(id);
    return this.notificationService.getNotificationById(notificationId, userId);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    const userId = BigInt(req.user.id);
    const notificationId = BigInt(id);
    return this.notificationService.markAsRead(notificationId, userId);
  }

  @Put('read-all')
  async markAllAsRead(@Request() req: any) {
    const userId = BigInt(req.user.id);
    return this.notificationService.markAllAsRead(userId);
  }

  @Delete()
  async clearNotifications(
    @Request() req: any,
    @Query('type') type?: string,
  ) {
    const userId = BigInt(req.user.id);
    return this.notificationService.clearNotifications(userId, type);
  }
}

