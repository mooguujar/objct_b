import prisma from '../../utils/prisma'
import { getCurrentUser } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 20
  const skip = (page - 1) * pageSize

  // 获取当前用户（可选）
  const currentUser = await getCurrentUser(event)
  const userId = currentUser?.userId || null

  // 查询帖子列表（发现页：所有公开的帖子）
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
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
        },
        island: {
          select: {
            id: true,
            name: true,
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
          : false,
        post_collect: userId
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
      skip,
      take: pageSize
    }),
    prisma.post.count({
      where: {
        status: 'active'
      }
    })
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
    island: post.island
      ? {
          id: Number(post.island.id),
          name: post.island.name,
          avatar: post.island.avatar
        }
      : null,
    isLiked: userId ? (post.post_like && Array.isArray(post.post_like) ? post.post_like.length > 0 : false) : false,
    isCollected: userId ? (post.post_collect && Array.isArray(post.post_collect) ? post.post_collect.length > 0 : false) : false
  }))

  return {
    code: 200,
    message: '获取成功',
    data: {
      list: formattedPosts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  }
})

