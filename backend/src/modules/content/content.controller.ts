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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';

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
    @Request() req: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
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

    const result = await this.contentService.getPostById(postId, userId);
    return {
      code: 200,
      message: 'success',
      data: result,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async createPost(@Body() createDto: CreatePostDto, @Request() req: any) {
    const userId = BigInt(req.user.id);
    const result = await this.contentService.createPost(userId, {
      islandId: createDto.islandId,
      title: createDto.title,
      content: createDto.content,
      mediaType: createDto.mediaType,
      mediaUrls: createDto.mediaUrls,
    });
    return {
      code: 200,
      message: '发布成功',
      data: result,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updatePost(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreatePostDto>,
    @Request() req: any,
  ) {
    const userId = BigInt(req.user.id);
    const postId = BigInt(id);
    const result = await this.contentService.updatePost(postId, userId, {
      title: updateDto.title,
      content: updateDto.content,
      mediaUrls: updateDto.mediaUrls,
    });
    return {
      code: 200,
      message: '更新成功',
      data: result,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deletePost(@Param('id') id: string, @Request() req: any) {
    const userId = BigInt(req.user.id);
    const postId = BigInt(id);
    await this.contentService.deletePost(postId, userId);
    return {
      code: 200,
      message: '删除成功',
      data: null,
    };
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async likePost(@Param('id') id: string, @Request() req: any) {
    const userId = BigInt(req.user.id);
    const postId = BigInt(id);
    const result = await this.contentService.likePost(postId, userId);
    return {
      code: 200,
      message: '点赞成功',
      data: result,
    };
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async unlikePost(@Param('id') id: string, @Request() req: any) {
    const userId = BigInt(req.user.id);
    const postId = BigInt(id);
    const result = await this.contentService.unlikePost(postId, userId);
    return {
      code: 200,
      message: '取消点赞成功',
      data: result,
    };
  }

  @Post(':id/collect')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async collectPost(@Param('id') id: string, @Request() req: any) {
    const userId = BigInt(req.user.id);
    const postId = BigInt(id);
    const result = await this.contentService.collectPost(postId, userId);
    return {
      code: 200,
      message: '收藏成功',
      data: result,
    };
  }

  @Delete(':id/collect')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async uncollectPost(@Param('id') id: string, @Request() req: any) {
    const userId = BigInt(req.user.id);
    const postId = BigInt(id);
    const result = await this.contentService.uncollectPost(postId, userId);
    return {
      code: 200,
      message: '取消收藏成功',
      data: result,
    };
  }
}

