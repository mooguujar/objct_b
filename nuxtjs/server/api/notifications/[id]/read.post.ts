import prisma from '../../../utils/prisma'
import { getCurrentUser } from '../../../utils/jwt'

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event)
  if (!currentUser) {
    throw createError({
      statusCode: 401,
      message: '未登录'
    })
  }

  const userId = BigInt(currentUser.userId)
  const notificationId = BigInt(getRouterParam(event, 'id')!)

  // 检查通知是否存在且属于当前用户
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      user_id: userId
    }
  })

  if (!notification) {
    throw createError({
      statusCode: 404,
      message: '通知不存在'
    })
  }

  // 标记为已读
  await prisma.notification.update({
    where: {
      id: notificationId
    },
    data: {
      is_read: true
    }
  })

  return {
    code: 200,
    message: '标记成功'
  }
})

