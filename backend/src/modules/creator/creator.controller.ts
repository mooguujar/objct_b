import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreatorService } from './creator.service';

@Controller('creator')
export class CreatorController {
  constructor(private creatorService: CreatorService) {}

  @Post('apply')
  async apply(@Body() data: any) {
    // TODO: 从JWT获取userId
    const userId = BigInt(1);
    return this.creatorService.apply(userId, data);
  }

  @Get('status')
  async getStatus() {
    // TODO: 从JWT获取userId
    const userId = BigInt(1);
    return this.creatorService.getStatus(userId);
  }
}

