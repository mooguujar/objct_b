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
  const body = await readBody(event)
  const type = body.type as 'system' | 'interaction' | 'payment' | undefined

  // 构建查询条件
  const where: any = {
    user_id: userId
  }

  if (type && ['system', 'interaction', 'payment'].includes(type)) {
    where.type = type
  }

  // 删除所有通知
  await prisma.notification.deleteMany({
    where
  })

  return {
    code: 200,
    message: '清除成功'
  }
})

