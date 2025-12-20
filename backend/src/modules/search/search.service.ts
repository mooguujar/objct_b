import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchPosts(keyword: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const where = {
      status: 'active' as const,
      OR: [
        { title: { contains: keyword } },
        { content: { contains: keyword } },
      ],
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

  async searchUsers(keyword: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const where = {
      status: 'active' as const,
      OR: [
        { username: { contains: keyword } },
        { nickname: { contains: keyword } },
      ],
    };

    const [list, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        select: {
          id: true,
          nickname: true,
          avatar: true,
          bio: true,
          followerCount: true,
        },
      }),
      this.prisma.user.count({ where }),
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

  async searchIslands(keyword: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const where = {
      status: 'active' as const,
      OR: [
        { name: { contains: keyword } },
        { description: { contains: keyword } },
      ],
    };

    const [list, total] = await Promise.all([
      this.prisma.island.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          owner: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.island.count({ where }),
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
}

