import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get(':postId')
  async getCommentList(
    @Param('postId') postId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id ? BigInt(req.user.id) : undefined;
    const postIdBigInt = BigInt(postId);
    
    const result = await this.commentService.getCommentList(postIdBigInt, {
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
      sort,
      userId,
    });
    
    return {
      code: 200,
      message: 'success',
      data: result,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async createComment(@Body() createDto: CreateCommentDto, @Request() req: any) {
    const userId = BigInt(req.user.id);
    const result = await this.commentService.createComment(userId, {
      postId: createDto.postId,
      content: createDto.content,
      parentId: createDto.parentId,
    });
    return {
      code: 200,
      message: '评论成功',
      data: result,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteComment(@Param('id') id: string, @Request() req: any) {
    const userId = BigInt(req.user.id);
    const commentId = BigInt(id);
    await this.commentService.deleteComment(commentId, userId);
    return {
      code: 200,
      message: '删除成功',
      data: null,
    };
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async likeComment(@Param('id') id: string, @Request() req: any) {
    const userId = BigInt(req.user.id);
    const commentId = BigInt(id);
    const result = await this.commentService.likeComment(commentId, userId);
    return {
      code: 200,
      message: '点赞成功',
      data: result,
    };
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async unlikeComment(@Param('id') id: string, @Request() req: any) {
    const userId = BigInt(req.user.id);
    const commentId = BigInt(id);
    const result = await this.commentService.unlikeComment(commentId, userId);
    return {
      code: 200,
      message: '取消点赞成功',
      data: result,
    };
  }
}

