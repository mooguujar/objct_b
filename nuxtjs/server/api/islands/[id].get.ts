import prisma from '../../utils/prisma'
import { getCurrentUser } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const islandId = getRouterParam(event, 'id')
  if (!islandId) {
    throw createError({
      statusCode: 400,
      message: '岛屿ID不能为空'
    })
  }

  // 获取当前用户（可选）
  const currentUser = await getCurrentUser(event)
  const userId = currentUser?.userId || null

  // 查询岛屿详情
  const island = await prisma.island.findUnique({
    where: {
      id: BigInt(islandId)
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          nickname: true,
          avatar: true
        }
      },
      island_member: userId
        ? {
            where: {
              user_id: BigInt(userId)
            },
            select: {
              id: true,
              join_type: true,
              paid_amount: true
            },
            take: 1
          }
        : false
    }
  })

  if (!island) {
    throw createError({
      statusCode: 404,
      message: '岛屿不存在'
    })
  }

  // 检查用户是否已加入
  const isMember = userId
    ? (island.island_member && Array.isArray(island.island_member) ? island.island_member.length > 0 : false)
    : false

  // 格式化数据
  const formattedIsland = {
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
    status: island.status,
    createdAt: island.created_at.toISOString(),
    updatedAt: island.updated_at.toISOString(),
    owner: {
      id: Number(island.user.id),
      username: island.user.username,
      nickname: island.user.nickname,
      avatar: island.user.avatar
    },
    isMember,
    joinType: isMember && island.island_member && Array.isArray(island.island_member) && island.island_member.length > 0
      ? island.island_member[0].join_type
      : null
  }

  return {
    code: 200,
    message: '获取成功',
    data: formattedIsland
  }
})

