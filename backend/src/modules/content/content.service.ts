import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, pageSize = 20, filters?: any) {
    const skip = (page - 1) * pageSize;
    const where: any = {
      status: 'active',
    };

    if (filters?.category) {
      // 根据分类筛选
    }

    if (filters?.mediaType) {
      where.mediaType = filters.mediaType;
    }

    const [list, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
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
          island: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: filters?.sort === 'hot' 
          ? { likeCount: 'desc' } 
          : { createdAt: 'desc' },
      }),
      this.prisma.post.count({ where }),
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

  async findFollowing(userId: bigint, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;

    const followingUsers = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = followingUsers.map((f) => f.followingId);

    const where = {
      userId: { in: followingIds },
      status: 'active',
    };

    const [list, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
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
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count({ where }),
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

  async findOne(id: bigint) {
    return this.prisma.post.findUnique({
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
  }
}

