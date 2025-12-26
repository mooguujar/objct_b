import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Number(query.limit) || 10

  // 查询推荐的岛屿（按成员数和帖子数排序，取前N个）
  const islands = await prisma.island.findMany({
    where: {
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
    orderBy: [
      { member_count: 'desc' },
      { post_count: 'desc' },
      { created_at: 'desc' }
    ],
    take: limit
  })

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
      list: formattedIslands
    }
  }
})

