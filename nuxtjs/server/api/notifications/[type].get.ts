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
  const type = getRouterParam(event, 'type') as 'system' | 'interaction' | 'payment'

  if (!['system', 'interaction', 'payment'].includes(type)) {
    throw createError({
      statusCode: 400,
      message: '无效的通知类型'
    })
  }

  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 20
  const skip = (page - 1) * pageSize

  // 查询通知列表
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: {
        user_id: userId,
        type: type
      },
      orderBy: {
        created_at: 'desc'
      },
      skip,
      take: pageSize
    }),
    prisma.notification.count({
      where: {
        user_id: userId,
        type: type
      }
    })
  ])

  // 格式化数据
  const formattedNotifications = notifications.map((notification) => ({
    id: Number(notification.id),
    userId: Number(notification.user_id),
    type: notification.type,
    title: notification.title,
    content: notification.content,
    relatedId: notification.related_id ? Number(notification.related_id) : null,
    relatedType: notification.related_type,
    isRead: notification.is_read,
    createdAt: notification.created_at.toISOString()
  }))

  return {
    code: 200,
    message: '获取成功',
    data: {
      list: formattedNotifications,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  }
})

