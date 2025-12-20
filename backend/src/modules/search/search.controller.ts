import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('posts')
  async searchPosts(
    @Query('keyword') keyword: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 20,
  ) {
    return this.searchService.searchPosts(keyword, page, pageSize);
  }

  @Get('users')
  async searchUsers(
    @Query('keyword') keyword: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 20,
  ) {
    return this.searchService.searchUsers(keyword, page, pageSize);
  }

  @Get('islands')
  async searchIslands(
    @Query('keyword') keyword: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 20,
  ) {
    return this.searchService.searchIslands(keyword, page, pageSize);
  }
}

