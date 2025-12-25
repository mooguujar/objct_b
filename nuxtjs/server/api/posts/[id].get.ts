import prisma from '../../utils/prisma'
import { getCurrentUser } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const postId = getRouterParam(event, 'id')
  if (!postId) {
    throw createError({
      statusCode: 400,
      message: '帖子ID不能为空'
    })
  }

  // 获取当前用户（可选）
  const currentUser = await getCurrentUser(event)
  const userId = currentUser?.userId || null

  // 查询帖子详情
  const post = await prisma.post.findUnique({
    where: {
      id: BigInt(postId)
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          nickname: true,
          avatar: true,
          is_verified: true
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
    }
  })

  if (!post) {
    throw createError({
      statusCode: 404,
      message: '帖子不存在'
    })
  }

  // 检查帖子状态
  if (post.status !== 'active') {
    throw createError({
      statusCode: 404,
      message: '帖子不存在或已被删除'
    })
  }

  // 增加浏览量（异步，不阻塞响应）
  prisma.post.update({
    where: { id: BigInt(postId) },
    data: { view_count: { increment: 1 } }
  }).catch(console.error)

  // 格式化媒体URL
  let mediaUrls: string[] = []
  if (post.media_urls) {
    try {
      const urls = typeof post.media_urls === 'string' 
        ? JSON.parse(post.media_urls) 
        : post.media_urls
      mediaUrls = Array.isArray(urls) ? urls : []
    } catch (e) {
      console.error('Failed to parse media_urls:', e)
    }
  }

  // 格式化数据
  const formattedPost = {
    id: Number(post.id),
    userId: Number(post.user_id),
    islandId: post.island_id ? Number(post.island_id) : null,
    title: post.title,
    content: post.content,
    mediaType: post.media_type,
    mediaUrls: mediaUrls.length > 0 ? mediaUrls : null,
    likeCount: post.like_count,
    commentCount: post.comment_count,
    collectCount: post.collect_count,
    viewCount: post.view_count + 1, // 包含当前访问
    shareCount: post.share_count,
    isTop: post.is_top,
    status: post.status,
    createdAt: post.created_at.toISOString(),
    updatedAt: post.updated_at.toISOString(),
    user: {
      id: Number(post.user.id),
      username: post.user.username,
      nickname: post.user.nickname,
      avatar: post.user.avatar,
      isVerified: post.user.is_verified
    },
    island: post.island
      ? {
          id: Number(post.island.id),
          name: post.island.name,
          avatar: post.island.avatar
        }
      : null,
    isLiked: userId
      ? (post.post_like && Array.isArray(post.post_like) ? post.post_like.length > 0 : false)
      : false,
    isCollected: userId
      ? (post.post_collect && Array.isArray(post.post_collect) ? post.post_collect.length > 0 : false)
      : false
  }

  return {
    code: 200,
    message: '获取成功',
    data: formattedPost
  }
})

