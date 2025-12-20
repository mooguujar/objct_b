import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CreatorService } from './creator.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('creator')
export class CreatorController {
  constructor(private readonly creatorService: CreatorService) {}

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  async createApplication(
    @Body() createDto: CreateApplicationDto,
    @Request() req: any,
  ) {
    const userId = BigInt(req.user.id);
    const result = await this.creatorService.createApplication(userId, createDto);
    return {
      code: 200,
      message: '申请已提交',
      data: result,
    };
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getApplicationStatus(@Request() req: any) {
    const userId = BigInt(req.user.id);
    const result = await this.creatorService.getApplicationStatus(userId);
    return {
      code: 200,
      message: 'success',
      data: result,
    };
  }
}

