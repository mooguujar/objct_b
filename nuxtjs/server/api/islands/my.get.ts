import prisma from '../../utils/prisma'
import { getCurrentUser } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  // 获取当前用户
  const currentUser = await getCurrentUser(event)
  if (!currentUser?.userId) {
    throw createError({
      statusCode: 401,
      message: '请先登录'
    })
  }

  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 20

  // 查询我创建的岛屿
  const [islands, total] = await Promise.all([
    prisma.island.findMany({
      where: {
        owner_id: BigInt(currentUser.userId),
        status: 'active'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatar: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.island.count({
      where: {
        owner_id: BigInt(currentUser.userId),
        status: 'active'
      }
    })
  ])

  // 格式化数据
  const formattedIslands = islands.map((island) => ({
    id: Number(island.id),
    name: island.name,
    description: island.description,
    cover: island.cover,
    avatar: island.avatar,
    category: island.category,
    ownerId: Number(island.owner_id),
    price: Number(island.price),
    memberCount: island.member_count,
    postCount: island.post_count,
    isVerified: island.is_verified,
    createdAt: island.created_at.toISOString(),
    updatedAt: island.updated_at.toISOString(),
    owner: {
      id: Number(island.user.id),
      username: island.user.username,
      nickname: island.user.nickname,
      avatar: island.user.avatar
    }
  }))

  return {
    code: 200,
    message: '获取成功',
    data: {
      list: formattedIslands,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  }
})

