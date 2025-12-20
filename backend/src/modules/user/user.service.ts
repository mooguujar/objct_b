import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // 获取当前用户信息
  async getCurrentUser(userId: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        nickname: true,
        avatar: true,
        bio: true,
        backgroundImage: true,
        gender: true,
        birthday: true,
        role: true,
        isVerified: true,
        coinBalance: true,
        followCount: true,
        followerCount: true,
        postCount: true,
        likeCount: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  // 获取用户主页信息
  async getUserProfile(userId: bigint, currentUserId?: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        nickname: true,
        avatar: true,
        bio: true,
        backgroundImage: true,
        isVerified: true,
        followCount: true,
        followerCount: true,
        postCount: true,
        likeCount: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 查询关注关系
    let isFollowing = false;
    let isFollower = false;

    if (currentUserId) {
      const follow = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId,
          },
        },
      });

      isFollowing = !!follow;

      const reverseFollow = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: currentUserId,
          },
        },
      });

      isFollower = !!reverseFollow;
    }

    return {
      ...user,
      isFollowing,
      isFollower,
    };
  }

  // 获取用户帖子列表
  async getUserPosts(
    userId: bigint,
    options: {
      page?: number;
      pageSize?: number;
      currentUserId?: bigint;
    },
  ) {
    const { page = 1, pageSize = 20, currentUserId } = options;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // 查询总数
    const total = await this.prisma.post.count({
      where: {
        userId,
        status: 'active',
        islandId: null, // 只查询个人动态，不包括岛屿帖子
      },
    });

    // 查询列表
    const posts = await this.prisma.post.findMany({
      where: {
        userId,
        status: 'active',
        islandId: null,
      },
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
      },
    });

    // 查询当前用户的点赞和收藏状态
    let likedPostIds: bigint[] = [];
    let collectedPostIds: bigint[] = [];

    if (currentUserId) {
      const [liked, collected] = await Promise.all([
        this.prisma.postLike.findMany({
          where: {
            userId: currentUserId,
            postId: { in: posts.map((p) => p.id) },
          },
          select: { postId: true },
        }),
        this.prisma.postCollect.findMany({
          where: {
            userId: currentUserId,
            postId: { in: posts.map((p) => p.id) },
          },
          select: { postId: true },
        }),
      ]);

      likedPostIds = liked.map((item) => item.postId);
      collectedPostIds = collected.map((item) => item.postId);
    }

    const list = posts.map((post) => ({
      id: post.id,
      user: post.user,
      island: null,
      title: post.title,
      content: post.content,
      mediaType: post.mediaType,
      mediaUrls: post.mediaUrls as string[],
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

  // 关注用户
  async followUser(followerId: bigint, followingId: bigint) {
    if (followerId === followingId) {
      throw new NotFoundException('不能关注自己');
    }

    // 检查被关注用户是否存在
    const following = await this.prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!following || following.status !== 'active') {
      throw new NotFoundException('用户不存在');
    }

    // 检查是否已关注
    const existing = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existing) {
      return { isFollowing: true };
    }

    // 创建关注关系
    await this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    // 更新关注数和粉丝数
    await Promise.all([
      this.prisma.user.update({
        where: { id: followerId },
        data: { followCount: { increment: 1 } },
      }),
      this.prisma.user.update({
        where: { id: followingId },
        data: { followerCount: { increment: 1 } },
      }),
    ]);

    return { isFollowing: true };
  }

  // 取消关注
  async unfollowUser(followerId: bigint, followingId: bigint) {
    // 检查是否已关注
    const existing = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!existing) {
      return { isFollowing: false };
    }

    // 删除关注关系
    await this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    // 更新关注数和粉丝数
    await Promise.all([
      this.prisma.user.update({
        where: { id: followerId },
        data: { followCount: { decrement: 1 } },
      }),
      this.prisma.user.update({
        where: { id: followingId },
        data: { followerCount: { decrement: 1 } },
      }),
    ]);

    return { isFollowing: false };
  }

  // 获取关注列表
  async getFollowings(
    userId: bigint,
    options: {
      page?: number;
      pageSize?: number;
      currentUserId?: bigint;
    },
  ) {
    const { page = 1, pageSize = 20, currentUserId } = options;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where = { followerId: userId };

    const total = await this.prisma.follow.count({ where });

    const follows = await this.prisma.follow.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        following: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            bio: true,
            followerCount: true,
          },
        },
      },
    });

    // 查询当前用户是否关注了这些用户
    let followingIds: bigint[] = [];
    if (currentUserId) {
      const userFollowings = await this.prisma.follow.findMany({
        where: {
          followerId: currentUserId,
          followingId: { in: follows.map((f) => f.followingId) },
        },
        select: { followingId: true },
      });
      followingIds = userFollowings.map((f) => f.followingId);
    }

    const list = follows.map((follow) => ({
      id: follow.following.id.toString(),
      nickname: follow.following.nickname,
      avatar: follow.following.avatar,
      bio: follow.following.bio,
      followerCount: follow.following.followerCount,
      isFollowing: currentUserId
        ? followingIds.includes(follow.followingId)
        : false,
      isFollower: currentUserId === follow.followingId,
      createdAt: follow.createdAt,
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

  // 获取粉丝列表
  async getFollowers(
    userId: bigint,
    options: {
      page?: number;
      pageSize?: number;
      currentUserId?: bigint;
    },
  ) {
    const { page = 1, pageSize = 20, currentUserId } = options;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where = { followingId: userId };

    const total = await this.prisma.follow.count({ where });

    const follows = await this.prisma.follow.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        follower: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            bio: true,
            followerCount: true,
          },
        },
      },
    });

    // 查询当前用户是否关注了这些用户
    let followingIds: bigint[] = [];
    if (currentUserId) {
      const userFollowings = await this.prisma.follow.findMany({
        where: {
          followerId: currentUserId,
          followingId: { in: follows.map((f) => f.followerId) },
        },
        select: { followingId: true },
      });
      followingIds = userFollowings.map((f) => f.followingId);
    }

    const list = follows.map((follow) => ({
      id: follow.follower.id.toString(),
      nickname: follow.follower.nickname,
      avatar: follow.follower.avatar,
      bio: follow.follower.bio,
      followerCount: follow.follower.followerCount,
      isFollowing: currentUserId
        ? followingIds.includes(follow.followerId)
        : false,
      isFollower: true,
      createdAt: follow.createdAt,
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
}

