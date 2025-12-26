import prisma from '../../../utils/prisma'
import { getCurrentUser } from '../../../utils/jwt'

export default defineEventHandler(async (event) => {
  try {
    const postId = getRouterParam(event, 'id')
    if (!postId) {
      throw createError({
        statusCode: 400,
        message: '帖子ID不能为空'
      })
    }

    const query = getQuery(event)
    const page = Number(query.page) || 1
    const pageSize = Number(query.pageSize) || 20

    // 获取当前用户（可选）
    const currentUser = await getCurrentUser(event)
    const userId = currentUser?.userId || null

    // 查询评论总数
    const total = await prisma.comment.count({
      where: {
        post_id: BigInt(postId),
        status: 'active',
        parent_id: null // 只统计顶级评论
      }
    })

    // 查询评论列表
    const comments = await prisma.comment.findMany({
      where: {
        post_id: BigInt(postId),
        status: 'active',
        parent_id: null // 只查询顶级评论
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
        comment_like: userId
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
        other_comment: {
          where: {
            status: 'active'
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
            comment_like: userId
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
            created_at: 'asc'
          },
          take: 3 // 每个顶级评论最多显示3条回复
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    })

    // 格式化评论数据
    const formattedComments = comments.map((comment) => {
      const isLiked = userId
        ? (comment.comment_like && Array.isArray(comment.comment_like) ? comment.comment_like.length > 0 : false)
        : false

      return {
        id: Number(comment.id),
        postId: Number(comment.post_id),
        userId: Number(comment.user_id),
        content: comment.content,
        parentId: comment.parent_id ? Number(comment.parent_id) : null,
        likeCount: comment.like_count,
        status: comment.status,
        createdAt: comment.created_at.toISOString(),
        updatedAt: comment.updated_at.toISOString(),
        user: {
          id: Number(comment.user.id),
          username: comment.user.username,
          nickname: comment.user.nickname,
          avatar: comment.user.avatar,
          isVerified: comment.user.is_verified
        },
        isLiked,
        replies: comment.other_comment.map((reply) => {
          const replyIsLiked = userId
            ? (reply.comment_like && Array.isArray(reply.comment_like) ? reply.comment_like.length > 0 : false)
            : false

          return {
            id: Number(reply.id),
            postId: Number(reply.post_id),
            userId: Number(reply.user_id),
            content: reply.content,
            parentId: reply.parent_id ? Number(reply.parent_id) : null,
            likeCount: reply.like_count,
            status: reply.status,
            createdAt: reply.created_at.toISOString(),
            updatedAt: reply.updated_at.toISOString(),
            user: {
              id: Number(reply.user.id),
              username: reply.user.username,
              nickname: reply.user.nickname,
              avatar: reply.user.avatar,
              isVerified: reply.user.is_verified
            },
            isLiked: replyIsLiked
          }
        })
      }
    })

    return {
      code: 200,
      message: '获取成功',
      data: {
        list: formattedComments,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    }
  } catch (error: any) {
    console.error('Error fetching comments:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '获取评论失败'
    })
  }
})
