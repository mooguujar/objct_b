import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class IslandService {
  constructor(private prisma: PrismaService) {}

  async getHotIslands(category?: string, limit = 10) {
    const where: any = {
      status: 'active',
    };

    if (category) {
      where.category = category;
    }

    // 按成员数和帖子数排序
    const islands = await this.prisma.island.findMany({
      where,
      orderBy: [
        { memberCount: 'desc' },
        { postCount: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
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

    return islands.map((island) => ({
      id: island.id.toString(),
      name: island.name,
      description: island.description,
      cover: island.cover,
      avatar: island.avatar,
      category: island.category,
      owner: island.owner,
      price: Number(island.price),
      memberCount: island.memberCount,
      postCount: island.postCount,
      isVerified: island.isVerified,
      createdAt: island.createdAt,
    }));
  }

  async getMyIslands(
    userId: bigint,
    filter?: 'joined' | 'created',
    page = 1,
    pageSize = 20,
  ) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    let where: any = {};

    if (filter === 'created') {
      // 我创建的岛屿
      where.ownerId = userId;
      where.status = 'active';
    } else {
      // 我加入的岛屿
      const memberships = await this.prisma.islandMember.findMany({
        where: { userId },
        select: { islandId: true },
      });

      const islandIds = memberships.map((m) => m.islandId);
      where.id = { in: islandIds };
      where.status = 'active';
    }

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

    return {
      list: islands.map((island) => ({
        id: island.id.toString(),
        name: island.name,
        description: island.description,
        cover: island.cover,
        avatar: island.avatar,
        category: island.category,
        owner: island.owner,
        price: Number(island.price),
        memberCount: island.memberCount,
        postCount: island.postCount,
        isVerified: island.isVerified,
        createdAt: island.createdAt,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getIslandById(id: bigint, userId?: bigint) {
    const island = await this.prisma.island.findUnique({
      where: { id },
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

    if (!island || island.status !== 'active') {
      throw new NotFoundException('岛屿不存在');
    }

    // 查询用户是否已加入
    let isMember = false;
    if (userId) {
      const member = await this.prisma.islandMember.findUnique({
        where: {
          userId_islandId: {
            userId,
            islandId: id,
          },
        },
      });
      isMember = !!member;
    }

    return {
      id: island.id.toString(),
      name: island.name,
      description: island.description,
      cover: island.cover,
      avatar: island.avatar,
      category: island.category,
      owner: island.owner,
      price: Number(island.price),
      memberCount: island.memberCount,
      postCount: island.postCount,
      isVerified: island.isVerified,
      isMember,
      createdAt: island.createdAt,
    };
  }

  async getIslandPosts(islandId: bigint, page = 1, pageSize = 20, userId?: bigint) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where = {
      islandId,
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
      },
    });

    // 查询点赞和收藏状态
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

    const list = posts.map((post) => ({
      id: post.id.toString(),
      user: post.user,
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
}

