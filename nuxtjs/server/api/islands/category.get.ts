import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const category = query.category as string
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 20
  const skip = (page - 1) * pageSize

  // 构建查询条件
  const where: any = {
    status: 'active'
  }

  if (category && category !== 'all') {
    where.category = category
  }

  // 查询指定分类的岛屿
  const [islands, total] = await Promise.all([
    prisma.island.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatar: true
          }
        },
        post: {
          where: {
            status: 'active'
          },
          select: {
            id: true,
            media_urls: true,
            media_type: true
          },
          take: 6,
          orderBy: {
            created_at: 'desc'
          }
        }
      },
      orderBy: [
        { member_count: 'desc' },
        { post_count: 'desc' },
        { created_at: 'desc' }
      ],
      skip,
      take: pageSize
    }),
    prisma.island.count({
      where
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
    },
    previewPosts: island.post.map((post) => ({
      id: Number(post.id),
      mediaUrls: post.media_urls as string[] | null,
      mediaType: post.media_type
    }))
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

