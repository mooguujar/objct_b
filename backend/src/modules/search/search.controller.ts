import {
  Controller,
  Get,
  Query,
  Request,
} from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('posts')
  async searchPosts(
    @Query('keyword') keyword: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Request() req?: any,
  ) {
    if (!keyword || keyword.trim().length === 0) {
      return {
        code: 400,
        message: '关键词不能为空',
        data: null,
      };
    }

    const userId = req?.user?.id ? BigInt(req.user.id) : undefined;
    const result = await this.searchService.searchPosts(keyword, {
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
      userId,
    });

    return {
      code: 200,
      message: 'success',
      data: result,
    };
  }

  @Get('users')
  async searchUsers(
    @Query('keyword') keyword: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Request() req?: any,
  ) {
    if (!keyword || keyword.trim().length === 0) {
      return {
        code: 400,
        message: '关键词不能为空',
        data: null,
      };
    }

    const currentUserId = req?.user?.id ? BigInt(req.user.id) : undefined;
    const result = await this.searchService.searchUsers(keyword, {
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

  @Get('islands')
  async searchIslands(
    @Query('keyword') keyword: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Request() req?: any,
  ) {
    if (!keyword || keyword.trim().length === 0) {
      return {
        code: 400,
        message: '关键词不能为空',
        data: null,
      };
    }

    const currentUserId = req?.user?.id ? BigInt(req.user.id) : undefined;
    const result = await this.searchService.searchIslands(keyword, {
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

