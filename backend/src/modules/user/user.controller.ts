import {
  Controller,
  Get,
  UseGuards,
  Request,
  Param,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req: any) {
    const userId = BigInt(req.user.id);
    const user = await this.userService.getCurrentUser(userId);
    return {
      code: 200,
      message: 'success',
      data: user,
    };
  }

  @Get(':id')
  async getUserProfile(@Param('id') id: string, @Request() req?: any) {
    const userId = BigInt(id);
    const currentUserId = req?.user?.id ? BigInt(req.user.id) : undefined;
    const user = await this.userService.getUserProfile(userId, currentUserId);
    return {
      code: 200,
      message: 'success',
      data: user,
    };
  }

  @Get(':id/posts')
  async getUserPosts(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Request() req?: any,
  ) {
    const userId = BigInt(id);
    const currentUserId = req?.user?.id ? BigInt(req.user.id) : undefined;
    const result = await this.userService.getUserPosts(userId, {
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
      currentUserId,
    });
    return {
      code: 200,
      message: 'success',
      data: result,
    };
  }
}

