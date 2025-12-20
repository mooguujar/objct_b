import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { IslandService } from './island.service';

@Controller('islands')
export class IslandController {
  constructor(private islandService: IslandService) {}

  @Get('hot')
  async findHot(
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('category') category?: string,
  ) {
    return { list: await this.islandService.findHot(limit, category) };
  }

  @Get('my')
  async findMy(@Query('type') type = 'joined') {
    // TODO: 从JWT获取userId
    const userId = BigInt(1);
    return { list: await this.islandService.findMy(userId, type) };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.islandService.findOne(BigInt(id));
  }
}

