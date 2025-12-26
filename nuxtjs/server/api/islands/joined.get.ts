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

  // 查询我加入的岛屿
  const [members, total] = await Promise.all([
    prisma.island_member.findMany({
      where: {
        user_id: BigInt(currentUser.userId)
      },
      include: {
        island: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                nickname: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.island_member.count({
      where: {
        user_id: BigInt(currentUser.userId)
      }
    })
  ])

  // 格式化数据
  const formattedIslands = members
    .filter((member) => member.island.status === 'active') // 只返回活跃状态的岛屿
    .map((member) => ({
      id: Number(member.island.id),
      name: member.island.name,
      description: member.island.description,
      cover: member.island.cover,
      avatar: member.island.avatar,
      category: member.island.category,
      ownerId: Number(member.island.owner_id),
      price: Number(member.island.price),
      memberCount: member.island.member_count,
      postCount: member.island.post_count,
      isVerified: member.island.is_verified,
      createdAt: member.island.created_at.toISOString(),
      updatedAt: member.island.updated_at.toISOString(),
      owner: {
        id: Number(member.island.user.id),
        username: member.island.user.username,
        nickname: member.island.user.nickname,
        avatar: member.island.user.avatar
      },
      joinType: member.join_type,
      joinTime: member.created_at.toISOString()
    }))

  // 重新计算总数（只统计活跃状态的岛屿）
  const activeTotal = await prisma.island_member.count({
    where: {
      user_id: BigInt(currentUser.userId),
      island: {
        status: 'active'
      }
    }
  })

  return {
    code: 200,
    message: '获取成功',
    data: {
      list: formattedIslands,
      pagination: {
        page,
        pageSize,
        total: activeTotal,
        totalPages: Math.ceil(activeTotal / pageSize)
      }
    }
  }
})

