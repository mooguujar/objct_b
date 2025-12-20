import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async getPostList(options: {
    page?: number;
    pageSize?: number;
    category?: string;
    mediaType?: string;
    sort?: string;
    userId?: bigint;
  }) {
    const {
      page = 1,
      pageSize = 20,
      category,
      mediaType,
      sort = 'latest',
      userId,
    } = options;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // 构建查询条件
    const where: any = {
      status: 'active',
    };

    // 筛选条件
    if (category) {
      where.island = {
        category,
      };
    }

    if (mediaType) {
      where.mediaType = mediaType;
    }

    // 排序
    let orderBy: any = {};
    if (sort === 'hot') {
      orderBy = [
        { likeCount: 'desc' },
        { commentCount: 'desc' },
        { createdAt: 'desc' },
      ];
    } else {
      orderBy = { createdAt: 'desc' };
    }

    // 查询总数
    const total = await this.prisma.post.count({ where });

    // 查询列表（优化：只查询必要字段）
    const posts = await this.prisma.post.findMany({
      where,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        title: true,
        content: true,
        mediaType: true,
        mediaUrls: true,
        likeCount: true,
        commentCount: true,
        collectCount: true,
        viewCount: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        island: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // 查询当前用户的点赞和收藏状态
    let likedPostIds: bigint[] = [];
    let collectedPostIds: bigint[] = [];

    if (userId) {
      const [liked, collected] = await Promise.all([
        this.prisma.postLike.findMany({
          where: { userId },
          select: { postId: true },
        }),
        this.prisma.postCollect.findMany({
          where: { userId },
          select: { postId: true },
        }),
      ]);

      likedPostIds = liked.map((item) => item.postId);
      collectedPostIds = collected.map((item) => item.postId);
    }

    // 格式化数据
    const list = posts.map((post) => ({
      id: post.id.toString(),
      user: post.user,
      island: post.island,
      title: post.title,
      content: post.content,
      mediaType: post.mediaType,
      mediaUrls: post.mediaUrls || [],
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      collectCount: post.collectCount,
      viewCount: post.viewCount,
      isLiked: userId ? likedPostIds.includes(post.id) : false,
      isCollected: userId ? collectedPostIds.includes(post.id) : false,
      createdAt: post.createdAt,
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

  async getFollowingPosts(userId: bigint, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // 查询用户关注的所有用户ID
    const follows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = follows.map((f) => f.followingId);

    if (followingIds.length === 0) {
      return {
        list: [],
        pagination: {
          page,
          pageSize,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // 查询关注用户的帖子
    const where = {
      userId: { in: followingIds },
      status: 'active' as const,
    };

    const total = await this.prisma.post.count({ where });

    const posts = await this.prisma.post.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        island: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // 查询点赞和收藏状态
    const [liked, collected] = await Promise.all([
      this.prisma.postLike.findMany({
        where: { userId },
        select: { postId: true },
      }),
      this.prisma.postCollect.findMany({
        where: { userId },
        select: { postId: true },
      }),
    ]);

    const likedPostIds = liked.map((item) => item.postId);
    const collectedPostIds = collected.map((item) => item.postId);

    const list = posts.map((post) => ({
      id: post.id.toString(),
      user: post.user,
      island: post.island,
      title: post.title,
      content: post.content,
      mediaType: post.mediaType,
      mediaUrls: post.mediaUrls || [],
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      collectCount: post.collectCount,
      viewCount: post.viewCount,
      isLiked: likedPostIds.includes(post.id),
      isCollected: collectedPostIds.includes(post.id),
      createdAt: post.createdAt,
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

  async getPostById(id: bigint, userId?: bigint) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        island: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!post || post.status !== 'active') {
      throw new NotFoundException('帖子不存在');
    }

    // 增加浏览量
    await this.prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // 查询点赞和收藏状态
    let isLiked = false;
    let isCollected = false;

    if (userId) {
      const [liked, collected] = await Promise.all([
        this.prisma.postLike.findUnique({
          where: {
            userId_postId: {
              userId,
              postId: id,
            },
          },
        }),
        this.prisma.postCollect.findUnique({
          where: {
            userId_postId: {
              userId,
              postId: id,
            },
          },
        }),
      ]);

      isLiked = !!liked;
      isCollected = !!collected;
    }

    // 查询关注关系
    let isFollowing = false;
    if (userId && userId !== post.userId) {
      const follow = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: post.userId,
          },
        },
      });
      isFollowing = !!follow;
    }

    return {
      id: post.id.toString(),
      user: {
        ...post.user,
        isFollowing,
      },
      island: post.island,
      title: post.title,
      content: post.content,
      mediaType: post.mediaType,
      mediaUrls: post.mediaUrls || [],
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      collectCount: post.collectCount,
      viewCount: post.viewCount + 1,
      shareCount: post.shareCount,
      isLiked,
      isCollected,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  // 发布内容
  async createPost(userId: bigint, data: {
    islandId?: bigint;
    title?: string;
    content?: string;
    mediaType: string;
    mediaUrls?: string[];
  }) {
    // 如果指定了岛屿，验证岛屿是否存在
    if (data.islandId) {
      const island = await this.prisma.island.findUnique({
        where: { id: data.islandId },
      });
      if (!island || island.status !== 'active') {
        throw new NotFoundException('岛屿不存在或已关闭');
      }
    }

    // 创建帖子
    const post = await this.prisma.post.create({
      data: {
        userId,
        islandId: data.islandId || null,
        title: data.title || null,
        content: data.content || null,
        mediaType: data.mediaType as any,
        mediaUrls: data.mediaUrls || [],
      },
    });

    // 更新用户帖子数
    await this.prisma.user.update({
      where: { id: userId },
      data: { postCount: { increment: 1 } },
    });

    // 如果是指定岛屿的帖子，更新岛屿帖子数
    if (data.islandId) {
      await this.prisma.island.update({
        where: { id: data.islandId },
        data: { postCount: { increment: 1 } },
      });
    }

    return {
      id: post.id.toString(),
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
    };
  }

  // 更新内容
  async updatePost(postId: bigint, userId: bigint, data: {
    title?: string;
    content?: string;
    mediaUrls?: string[];
  }) {
    // 验证帖子是否存在且属于当前用户
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('帖子不存在');
    }

    if (post.userId !== userId) {
      throw new NotFoundException('无权修改该帖子');
    }

    // 更新帖子
    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: {
        title: data.title !== undefined ? data.title : post.title,
        content: data.content !== undefined ? data.content : post.content,
        mediaUrls: data.mediaUrls !== undefined ? data.mediaUrls : (post.mediaUrls as any),
      },
    });

    return {
      id: updated.id.toString(),
      updatedAt: updated.updatedAt,
    };
  }

  // 删除内容
  async deletePost(postId: bigint, userId: bigint) {
    // 验证帖子是否存在且属于当前用户
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('帖子不存在');
    }

    if (post.userId !== userId) {
      throw new NotFoundException('无权删除该帖子');
    }

    // 软删除：更新状态为deleted
    await this.prisma.post.update({
      where: { id: postId },
      data: { status: 'deleted' },
    });

    // 更新用户帖子数
    await this.prisma.user.update({
      where: { id: userId },
      data: { postCount: { decrement: 1 } },
    });

    // 如果是岛屿帖子，更新岛屿帖子数
    if (post.islandId) {
      await this.prisma.island.update({
        where: { id: post.islandId },
        data: { postCount: { decrement: 1 } },
      });
    }
  }

  // 点赞帖子
  async likePost(postId: bigint, userId: bigint) {
    // 检查帖子是否存在
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.status !== 'active') {
      throw new NotFoundException('帖子不存在');
    }

    // 检查是否已点赞
    const existing = await this.prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existing) {
      // 已点赞，返回当前状态
      const updatedPost = await this.prisma.post.findUnique({
        where: { id: postId },
        select: { likeCount: true },
      });
      return {
        isLiked: true,
        likeCount: updatedPost?.likeCount || post.likeCount,
      };
    }

    // 创建点赞记录
    await this.prisma.postLike.create({
      data: {
        userId,
        postId,
      },
    });

    // 更新帖子点赞数
    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: { likeCount: { increment: 1 } },
    });

    // 更新用户获赞数
    await this.prisma.user.update({
      where: { id: post.userId },
      data: { likeCount: { increment: 1 } },
    });

    return {
      isLiked: true,
      likeCount: updated.likeCount,
    };
  }

  // 取消点赞
  async unlikePost(postId: bigint, userId: bigint) {
    // 检查是否已点赞
    const existing = await this.prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (!existing) {
      // 未点赞，返回当前状态
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
        select: { likeCount: true },
      });
      return {
        isLiked: false,
        likeCount: post?.likeCount || 0,
      };
    }

    // 删除点赞记录
    await this.prisma.postLike.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    // 更新帖子点赞数
    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: { likeCount: { decrement: 1 } },
    });

    // 获取帖子信息以更新用户获赞数
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true, likeCount: true },
    });

    if (post && post.likeCount > 0) {
      await this.prisma.user.update({
        where: { id: post.userId },
        data: { likeCount: { decrement: 1 } },
      });
    }

    return {
      isLiked: false,
      likeCount: updated.likeCount,
    };
  }

  // 收藏帖子
  async collectPost(postId: bigint, userId: bigint) {
    // 检查帖子是否存在
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.status !== 'active') {
      throw new NotFoundException('帖子不存在');
    }

    // 检查是否已收藏
    const existing = await this.prisma.postCollect.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existing) {
      // 已收藏，返回当前状态
      const updatedPost = await this.prisma.post.findUnique({
        where: { id: postId },
        select: { collectCount: true },
      });
      return {
        isCollected: true,
        collectCount: updatedPost?.collectCount || post.collectCount,
      };
    }

    // 创建收藏记录
    await this.prisma.postCollect.create({
      data: {
        userId,
        postId,
      },
    });

    // 更新帖子收藏数
    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: { collectCount: { increment: 1 } },
    });

    return {
      isCollected: true,
      collectCount: updated.collectCount,
    };
  }

  // 取消收藏
  async uncollectPost(postId: bigint, userId: bigint) {
    // 检查是否已收藏
    const existing = await this.prisma.postCollect.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (!existing) {
      // 未收藏，返回当前状态
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
        select: { collectCount: true },
      });
      return {
        isCollected: false,
        collectCount: post?.collectCount || 0,
      };
    }

    // 删除收藏记录
    await this.prisma.postCollect.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    // 更新帖子收藏数
    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: { collectCount: { decrement: 1 } },
    });

    return {
      isCollected: false,
      collectCount: updated.collectCount,
    };
  }
}

