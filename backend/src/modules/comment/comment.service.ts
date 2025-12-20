import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  // 获取评论列表
  async getCommentList(
    postId: bigint,
    options: {
      page?: number;
      pageSize?: number;
      sort?: string;
      userId?: bigint;
    },
  ) {
    const { page = 1, pageSize = 20, sort = 'latest', userId } = options;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // 构建查询条件
    const where: any = {
      postId,
      status: 'active',
      parentId: null, // 只查询顶级评论
    };

    // 排序
    let orderBy: any = {};
    if (sort === 'hot') {
      orderBy = [
        { likeCount: 'desc' },
        { createdAt: 'desc' },
      ];
    } else {
      orderBy = { createdAt: 'desc' };
    }

    // 查询总数
    const total = await this.prisma.comment.count({ where });

    // 查询列表
    const comments = await this.prisma.comment.findMany({
      where,
      skip,
      take,
      orderBy,
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

    // 查询每条评论的回复数和点赞状态
    const commentIds = comments.map((c) => c.id);
    const [replyCounts, likedCommentIds] = await Promise.all([
      // 查询回复数
      this.prisma.comment.groupBy({
        by: ['parentId'],
        where: {
          parentId: { in: commentIds },
          status: 'active',
        },
        _count: true,
      }),
      // 查询点赞状态
      userId
        ? this.prisma.commentLike.findMany({
            where: {
              userId,
              commentId: { in: commentIds },
            },
            select: { commentId: true },
          })
        : Promise.resolve([]),
    ]);

    const replyCountMap = new Map(
      replyCounts.map((item) => [item.parentId, item._count]),
    );
    const likedIds = new Set(likedCommentIds.map((item) => item.commentId));

    // 格式化数据
    const list = comments.map((comment) => ({
      id: comment.id.toString(),
      user: comment.user,
      content: comment.content,
      parentId: comment.parentId?.toString() || null,
      parent: null,
      likeCount: comment.likeCount,
      isLiked: likedIds.has(comment.id),
      replyCount: replyCountMap.get(comment.id) || 0,
      replies: [], // 回复列表可以在详情页单独加载
      createdAt: comment.createdAt,
    }));

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

  // 发表评论
  async createComment(userId: bigint, data: {
    postId: bigint;
    content: string;
    parentId?: bigint;
  }) {
    // 验证帖子是否存在
    const post = await this.prisma.post.findUnique({
      where: { id: data.postId },
    });

    if (!post || post.status !== 'active') {
      throw new NotFoundException('帖子不存在');
    }

    // 如果是回复，验证父评论是否存在
    if (data.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: data.parentId },
      });

      if (!parent || parent.status !== 'active') {
        throw new NotFoundException('父评论不存在');
      }

      if (parent.postId !== data.postId) {
        throw new BadRequestException('父评论不属于该帖子');
      }
    }

    // 创建评论
    const comment = await this.prisma.comment.create({
      data: {
        postId: data.postId,
        userId,
        content: data.content,
        parentId: data.parentId || null,
      },
    });

    // 更新帖子评论数
    await this.prisma.post.update({
      where: { id: data.postId },
      data: { commentCount: { increment: 1 } },
    });

    return {
      id: comment.id.toString(),
      content: comment.content,
      createdAt: comment.createdAt,
    };
  }

  // 删除评论
  async deleteComment(commentId: bigint, userId: bigint) {
    // 验证评论是否存在且属于当前用户
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    if (comment.userId !== userId) {
      throw new NotFoundException('无权删除该评论');
    }

    // 软删除：更新状态为deleted
    await this.prisma.comment.update({
      where: { id: commentId },
      data: { status: 'deleted' },
    });

    // 更新帖子评论数（需要计算实际删除的评论数，包括所有回复）
    const deletedCount = await this.prisma.comment.count({
      where: {
        OR: [
          { id: commentId },
          { parentId: commentId },
        ],
      },
    });

    await this.prisma.post.update({
      where: { id: comment.postId },
      data: { commentCount: { decrement: deletedCount } },
    });
  }

  // 点赞评论
  async likeComment(commentId: bigint, userId: bigint) {
    // 检查评论是否存在
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.status !== 'active') {
      throw new NotFoundException('评论不存在');
    }

    // 检查是否已点赞
    const existing = await this.prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    if (existing) {
      const updatedComment = await this.prisma.comment.findUnique({
        where: { id: commentId },
        select: { likeCount: true },
      });
      return {
        isLiked: true,
        likeCount: updatedComment?.likeCount || comment.likeCount,
      };
    }

    // 创建点赞记录
    await this.prisma.commentLike.create({
      data: {
        userId,
        commentId,
      },
    });

    // 更新评论点赞数
    const updated = await this.prisma.comment.update({
      where: { id: commentId },
      data: { likeCount: { increment: 1 } },
    });

    return {
      isLiked: true,
      likeCount: updated.likeCount,
    };
  }

  // 取消点赞评论
  async unlikeComment(commentId: bigint, userId: bigint) {
    // 检查是否已点赞
    const existing = await this.prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    if (!existing) {
      const comment = await this.prisma.comment.findUnique({
        where: { id: commentId },
        select: { likeCount: true },
      });
      return {
        isLiked: false,
        likeCount: comment?.likeCount || 0,
      };
    }

    // 删除点赞记录
    await this.prisma.commentLike.delete({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    // 更新评论点赞数
    const updated = await this.prisma.comment.update({
      where: { id: commentId },
      data: { likeCount: { decrement: 1 } },
    });

    return {
      isLiked: false,
      likeCount: updated.likeCount,
    };
  }
}

