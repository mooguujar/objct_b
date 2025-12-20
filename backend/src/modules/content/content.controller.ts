import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { ContentService } from './content.service';

@Controller('posts')
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Get('list')
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 20,
    @Query('category') category?: string,
    @Query('mediaType') mediaType?: string,
    @Query('sort') sort?: string,
  ) {
    return this.contentService.findAll(page, pageSize, {
      category,
      mediaType,
      sort,
    });
  }

  @Get('following')
  async findFollowing(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 20,
  ) {
    // TODO: 从JWT获取userId
    const userId = BigInt(1);
    return this.contentService.findFollowing(userId, page, pageSize);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contentService.findOne(BigInt(id));
  }
}

