import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IslandService } from './island.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('islands')
export class IslandController {
  constructor(private readonly islandService: IslandService) {}

  @Get('hot')
  async getHotIslands(@Query('category') category?: string) {
    return this.islandService.getHotIslands(category, 10);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyIslands(
    @Query('filter') filter?: 'joined' | 'created',
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Request() req: any,
  ) {
    const userId = BigInt(req.user.id);
    return this.islandService.getMyIslands(
      userId,
      filter,
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 20,
    );
  }

  @Get(':id')
  async getIslandById(@Param('id') id: string, @Request() req?: any) {
    const userId = req?.user?.id ? BigInt(req.user.id) : undefined;
    const islandId = BigInt(id);
    return this.islandService.getIslandById(islandId, userId);
  }

  @Get(':id/posts')
  async getIslandPosts(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id ? BigInt(req.user.id) : undefined;
    const islandId = BigInt(id);
    const result = await this.islandService.getIslandPosts(
      islandId,
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 20,
      userId,
    );
    return {
      code: 200,
      message: 'success',
      data: result,
    };
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async joinIsland(@Param('id') id: string, @Request() req: any) {
    const userId = BigInt(req.user.id);
    const islandId = BigInt(id);
    const result = await this.islandService.joinIsland(userId, islandId);
    return {
      code: 200,
      message: result.message,
      data: result,
    };
  }

  @Delete(':id/join')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async leaveIsland(@Param('id') id: string, @Request() req: any) {
    const userId = BigInt(req.user.id);
    const islandId = BigInt(id);
    const result = await this.islandService.leaveIsland(userId, islandId);
    return {
      code: 200,
      message: result.message,
      data: result,
    };
  }
}

