import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async findAll(postId: bigint, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;

    const [list, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: {
          postId,
          parentId: null,
          status: 'active',
        },
        skip,
        take: pageSize,
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  nickname: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.comment.count({
        where: { postId, parentId: null, status: 'active' },
      }),
    ]);

    return {
      list,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async create(userId: bigint, postId: bigint, content: string, parentId?: bigint) {
    const comment = await this.prisma.comment.create({
      data: {
        userId,
        postId,
        content,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    });

    // 更新帖子评论数
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        commentCount: { increment: 1 },
      },
    });

    return comment;
  }
}

