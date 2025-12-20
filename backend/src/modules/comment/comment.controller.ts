import { Controller, Get, Post, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { CommentService } from './comment.service';

@Controller('comments')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get(':postId')
  async findAll(
    @Param('postId', ParseIntPipe) postId: number,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 20,
  ) {
    return this.commentService.findAll(BigInt(postId), page, pageSize);
  }

  @Post()
  async create(
    @Body('postId', ParseIntPipe) postId: number,
    @Body('content') content: string,
    @Body('parentId') parentId?: number,
  ) {
    // TODO: 从JWT获取userId
    const userId = BigInt(1);
    return this.commentService.create(userId, BigInt(postId), content, parentId);
  }
}

