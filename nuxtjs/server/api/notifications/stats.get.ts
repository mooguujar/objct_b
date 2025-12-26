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

  // 获取各类型通知统计
  const [systemTotal, systemUnread, interactionTotal, interactionUnread, paymentTotal, paymentUnread] =
    await Promise.all([
      prisma.notification.count({
        where: {
          user_id: userId,
          type: 'system'
        }
      }),
      prisma.notification.count({
        where: {
          user_id: userId,
          type: 'system',
          is_read: false
        }
      }),
      prisma.notification.count({
        where: {
          user_id: userId,
          type: 'interaction'
        }
      }),
      prisma.notification.count({
        where: {
          user_id: userId,
          type: 'interaction',
          is_read: false
        }
      }),
      prisma.notification.count({
        where: {
          user_id: userId,
          type: 'payment'
        }
      }),
      prisma.notification.count({
        where: {
          user_id: userId,
          type: 'payment',
          is_read: false
        }
      })
    ])

  return {
    code: 200,
    message: '获取成功',
    data: {
      system: {
        total: systemTotal,
        unread: systemUnread
      },
      interaction: {
        total: interactionTotal,
        unread: interactionUnread
      },
      payment: {
        total: paymentTotal,
        unread: paymentUnread
      }
    }
  }
})

