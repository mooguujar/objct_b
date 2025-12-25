import prisma from '../../../utils/prisma'
import { getCurrentUser } from '../../../utils/jwt'

export default defineEventHandler(async (event) => {
  const islandId = getRouterParam(event, 'id')
  if (!islandId) {
    throw createError({
      statusCode: 400,
      message: '岛屿ID不能为空'
    })
  }

  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 20
  const skip = (page - 1) * pageSize

  // 获取当前用户（可选）
  const currentUser = await getCurrentUser(event)
  const userId = currentUser?.userId || null

  // 检查用户是否已加入岛屿
  let isMember = false
  if (userId) {
    const member = await prisma.island_member.findUnique({
      where: {
        user_id_island_id: {
          user_id: BigInt(userId),
          island_id: BigInt(islandId)
        }
      }
    })
    isMember = !!member
  }

  // 如果用户未加入，只返回前6个帖子作为预览
  const limit = isMember ? pageSize : 6

  // 查询岛屿帖子列表
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: {
        island_id: BigInt(islandId),
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
        },
        post_like: userId
          ? {
              where: {
                user_id: BigInt(userId)
              },
              select: {
                id: true
              },
              take: 1
            }
          : false
      },
      orderBy: {
        created_at: 'desc'
      },
      skip: isMember ? skip : 0,
      take: limit
    }),
    isMember
      ? prisma.post.count({
          where: {
            island_id: BigInt(islandId),
            status: 'active'
          }
        })
      : 0
  ])

  // 格式化数据
  const formattedPosts = posts.map((post) => ({
    id: Number(post.id),
    userId: Number(post.user_id),
    islandId: post.island_id ? Number(post.island_id) : null,
    title: post.title,
    content: post.content,
    mediaType: post.media_type,
    mediaUrls: post.media_urls as string[] | null,
    likeCount: post.like_count,
    commentCount: post.comment_count,
    collectCount: post.collect_count,
    viewCount: post.view_count,
    shareCount: post.share_count,
    isTop: post.is_top,
    createdAt: post.created_at.toISOString(),
    updatedAt: post.updated_at.toISOString(),
    user: {
      id: Number(post.user.id),
      username: post.user.username,
      nickname: post.user.nickname,
      avatar: post.user.avatar
    },
    isLiked: userId ? (post.post_like && Array.isArray(post.post_like) ? post.post_like.length > 0 : false) : false
  }))

  return {
    code: 200,
    message: '获取成功',
    data: {
      list: formattedPosts,
      pagination: {
        page: isMember ? page : 1,
        pageSize: isMember ? pageSize : 6,
        total: isMember ? total : posts.length,
        totalPages: isMember ? Math.ceil(total / pageSize) : 1
      },
      isMember
    }
  }
})

