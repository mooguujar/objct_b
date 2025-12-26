import prisma from '../../utils/prisma'
import { getCurrentUser } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const user = await getCurrentUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      message: '未登录'
    })
  }

  const userId = typeof user.userId === 'bigint' ? user.userId : BigInt(user.userId)
  const userInfo = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      phone: true,
      avatar: true,
      nickname: true,
      bio: true,
      role: true,
      status: true,
      created_at: true,
      updated_at: true
    }
  })
  
  if (userInfo) {
    // 转换BigInt为Number用于JSON序列化
    userInfo.id = Number(userInfo.id)
  }

  if (!userInfo) {
    throw createError({
      statusCode: 404,
      message: '用户不存在'
    })
  }

  return {
    code: 200,
    message: '获取成功',
    data: userInfo
  }
})

