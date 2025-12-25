import prisma from '../../utils/prisma'
import { getCurrentUser } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event)
  if (!currentUser) {
    throw createError({
      statusCode: 401,
      message: '未登录'
    })
  }

  const userId = BigInt(currentUser.userId)

  // 获取用户信息及统计数据
  const userInfo = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      nickname: true,
      avatar: true,
      bio: true,
      background_image: true,
      gender: true,
      birthday: true,
      phone: true,
      email: true,
      coin_balance: true,
      follow_count: true,
      follower_count: true,
      like_count: true,
      post_count: true,
      is_verified: true,
      role: true,
      created_at: true
    }
  })

  if (!userInfo) {
    throw createError({
      statusCode: 404,
      message: '用户不存在'
    })
  }

  // 生成用户唯一标识符（基于用户ID）
  const userCode = generateUserCode(Number(userInfo.id))

  return {
    code: 200,
    message: '获取成功',
    data: {
      id: Number(userInfo.id),
      username: userInfo.username,
      nickname: userInfo.nickname,
      avatar: userInfo.avatar,
      bio: userInfo.bio,
      backgroundImage: userInfo.background_image,
      gender: userInfo.gender,
      birthday: userInfo.birthday ? userInfo.birthday.toISOString().split('T')[0] : null,
      phone: userInfo.phone,
      email: userInfo.email,
      userCode: userCode,
      coinBalance: Number(userInfo.coin_balance),
      followCount: userInfo.follow_count,
      followerCount: userInfo.follower_count,
      likeCount: userInfo.like_count,
      postCount: userInfo.post_count,
      isVerified: userInfo.is_verified,
      role: userInfo.role,
      createdAt: userInfo.created_at.toISOString()
    }
  }
})

// 生成用户唯一标识符
function generateUserCode(userId: number): string {
  // 使用Base36编码生成类似 "19AKPcqVV" 的标识符
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let num = userId
  let result = ''
  
  while (num > 0) {
    result = chars[num % 36] + result
    num = Math.floor(num / 36)
  }
  
  // 如果长度不够，前面补0
  while (result.length < 9) {
    result = '0' + result
  }
  
  return result.slice(0, 9)
}

