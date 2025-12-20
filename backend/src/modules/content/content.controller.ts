import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('posts')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('list')
  async getPostList(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('category') category?: string,
    @Query('mediaType') mediaType?: string,
    @Query('sort') sort?: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id ? BigInt(req.user.id) : undefined;

    return this.contentService.getPostList({
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
      category,
      mediaType,
      sort,
      userId,
    });
  }

  @Get('following')
  @UseGuards(JwtAuthGuard)
  async getFollowingPosts(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Request() req: any,
  ) {
    const userId = BigInt(req.user.id);

    return this.contentService.getFollowingPosts(
      userId,
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 20,
    );
  }

  @Get(':id')
  async getPostById(@Param('id') id: string, @Request() req?: any) {
    const userId = req?.user?.id ? BigInt(req.user.id) : undefined;
    const postId = BigInt(id);

    return this.contentService.getPostById(postId, userId);
  }
}

