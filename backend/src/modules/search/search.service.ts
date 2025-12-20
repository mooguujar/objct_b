import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  // 搜索内容
  async searchPosts(
    keyword: string,
    options: {
      page?: number;
      pageSize?: number;
      userId?: bigint;
    },
  ) {
    const { page = 1, pageSize = 20, userId } = options;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: any = {
      status: 'active',
      OR: [
        { title: { contains: keyword } },
        { content: { contains: keyword } },
      ],
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
    let likedPostIds: bigint[] = [];
    let collectedPostIds: bigint[] = [];

    if (userId) {
      const [liked, collected] = await Promise.all([
        this.prisma.postLike.findMany({
          where: {
            userId,
            postId: { in: posts.map((p) => p.id) },
          },
          select: { postId: true },
        }),
        this.prisma.postCollect.findMany({
          where: {
            userId,
            postId: { in: posts.map((p) => p.id) },
          },
          select: { postId: true },
        }),
      ]);

      likedPostIds = liked.map((item) => item.postId);
      collectedPostIds = collected.map((item) => item.postId);
    }

    const list = posts.map((post) => ({
      id: post.id.toString(),
      user: post.user,
      island: post.island,
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

  // 搜索用户
  async searchUsers(
    keyword: string,
    options: {
      page?: number;
      pageSize?: number;
      currentUserId?: bigint;
    },
  ) {
    const { page = 1, pageSize = 20, currentUserId } = options;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: any = {
      status: 'active',
      OR: [
        { nickname: { contains: keyword } },
        { username: { contains: keyword } },
      ],
    };

    const total = await this.prisma.user.count({ where });

    const users = await this.prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nickname: true,
        username: true,
        avatar: true,
        bio: true,
        followerCount: true,
      },
    });

    // 查询关注关系
    let followingIds: bigint[] = [];
    if (currentUserId) {
      const follows = await this.prisma.follow.findMany({
        where: {
          followerId: currentUserId,
          followingId: { in: users.map((u) => u.id) },
        },
        select: { followingId: true },
      });
      followingIds = follows.map((f) => f.followingId);
    }

    const list = users.map((user) => ({
      id: user.id.toString(),
      nickname: user.nickname,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      followerCount: user.followerCount,
      isFollowing: followingIds.includes(user.id),
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

  // 搜索岛屿
  async searchIslands(
    keyword: string,
    options: {
      page?: number;
      pageSize?: number;
      currentUserId?: bigint;
    },
  ) {
    const { page = 1, pageSize = 20, currentUserId } = options;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: any = {
      status: 'active',
      OR: [
        { name: { contains: keyword } },
        { description: { contains: keyword } },
      ],
    };

    const total = await this.prisma.island.count({ where });

    const islands = await this.prisma.island.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    });

    // 查询是否已加入
    let joinedIslandIds: bigint[] = [];
    if (currentUserId) {
      const memberships = await this.prisma.islandMember.findMany({
        where: {
          userId: currentUserId,
          islandId: { in: islands.map((i) => i.id) },
        },
        select: { islandId: true },
      });
      joinedIslandIds = memberships.map((m) => m.islandId);
    }

    const list = islands.map((island) => ({
      id: island.id.toString(),
      name: island.name,
      description: island.description,
      cover: island.cover,
      avatar: island.avatar,
      category: island.category,
      owner: island.owner,
      price: island.price,
      memberCount: island.memberCount,
      postCount: island.postCount,
      isVerified: island.isVerified,
      isJoined: joinedIslandIds.includes(island.id),
      createdAt: island.createdAt,
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

