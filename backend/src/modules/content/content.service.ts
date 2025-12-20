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

    // 查询列表
    const posts = await this.prisma.post.findMany({
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
      status: 'active',
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
}

