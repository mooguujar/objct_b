import {
  Controller,
  Get,
  Post,
  Delete,
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

  @Post('follow/:id')
  @UseGuards(JwtAuthGuard)
  async followUser(@Param('id') id: string, @Request() req: any) {
    const followerId = BigInt(req.user.id);
    const followingId = BigInt(id);
    const result = await this.userService.followUser(followerId, followingId);
    return {
      code: 200,
      message: '关注成功',
      data: result,
    };
  }

  @Delete('follow/:id')
  @UseGuards(JwtAuthGuard)
  async unfollowUser(@Param('id') id: string, @Request() req: any) {
    const followerId = BigInt(req.user.id);
    const followingId = BigInt(id);
    const result = await this.userService.unfollowUser(followerId, followingId);
    return {
      code: 200,
      message: '取消关注成功',
      data: result,
    };
  }

  @Get('followings')
  @UseGuards(JwtAuthGuard)
  async getFollowings(
    @Request() req: any,
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const currentUserId = BigInt(req.user.id);
    const targetUserId = userId ? BigInt(userId) : currentUserId;
    const result = await this.userService.getFollowings(targetUserId, {
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

  @Get('followers')
  @UseGuards(JwtAuthGuard)
  async getFollowers(
    @Request() req: any,
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const currentUserId = BigInt(req.user.id);
    const targetUserId = userId ? BigInt(userId) : currentUserId;
    const result = await this.userService.getFollowers(targetUserId, {
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

