import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class IslandService {
  constructor(private prisma: PrismaService) {}

  async findHot(limit = 10, category?: string) {
    const where: any = {
      status: 'active',
    };

    if (category) {
      where.category = category;
    }

    return this.prisma.island.findMany({
      where,
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
      orderBy: { memberCount: 'desc' },
    });
  }

  async findMy(userId: bigint, type = 'joined') {
    if (type === 'owned') {
      return this.prisma.island.findMany({
        where: {
          ownerId: userId,
          status: 'active',
        },
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
      });
    } else {
      const memberships = await this.prisma.islandMember.findMany({
        where: { userId },
        include: {
          island: {
            include: {
              owner: {
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
      });
      return memberships.map((m) => m.island);
    }
  }

  async findOne(id: bigint) {
    return this.prisma.island.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            isVerified: true,
          },
        },
      },
    });
  }
}

