import prisma from '../../../utils/prisma'
import { getCurrentUser } from '../../../utils/jwt'

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event)
  if (!currentUser?.userId) {
    throw createError({
      statusCode: 401,
      message: '请先登录'
    })
  }

  const postId = getRouterParam(event, 'id')
  if (!postId) {
    throw createError({
      statusCode: 400,
      message: '帖子ID不能为空'
    })
  }

  const userId = BigInt(currentUser.userId)
  const postIdBigInt = BigInt(postId)

  // 检查帖子是否存在
  const post = await prisma.post.findUnique({
    where: {
      id: postIdBigInt
    }
  })

  if (!post) {
    throw createError({
      statusCode: 404,
      message: '帖子不存在'
    })
  }

  // 检查是否已点赞
  const existingLike = await prisma.post_like.findUnique({
    where: {
      user_id_post_id: {
        user_id: userId,
        post_id: postIdBigInt
      }
    }
  })

  if (existingLike) {
    // 取消点赞
    await prisma.$transaction([
      prisma.post_like.delete({
        where: {
          user_id_post_id: {
            user_id: userId,
            post_id: postIdBigInt
          }
        }
      }),
      prisma.post.update({
        where: {
          id: postIdBigInt
        },
        data: {
          like_count: {
            decrement: 1
          }
        }
      }),
      prisma.user.update({
        where: {
          id: BigInt(post.user_id)
        },
        data: {
          like_count: {
            decrement: 1
          }
        }
      })
    ])

    return {
      code: 200,
      message: '取消点赞成功',
      data: {
        isLiked: false,
        likeCount: post.like_count - 1
      }
    }
  } else {
    // 点赞
    await prisma.$transaction([
      prisma.post_like.create({
        data: {
          user_id: userId,
          post_id: postIdBigInt
        }
      }),
      prisma.post.update({
        where: {
          id: postIdBigInt
        },
        data: {
          like_count: {
            increment: 1
          }
        }
      }),
      prisma.user.update({
        where: {
          id: BigInt(post.user_id)
        },
        data: {
          like_count: {
            increment: 1
          }
        }
      })
    ])

    return {
      code: 200,
      message: '点赞成功',
      data: {
        isLiked: true,
        likeCount: post.like_count + 1
      }
    }
  }
})

