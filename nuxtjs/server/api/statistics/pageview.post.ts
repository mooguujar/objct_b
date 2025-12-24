import prisma from '../../utils/prisma'
import { getCurrentUser } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { pagePath, referrer, userAgent, device, duration } = body

  if (!pagePath) {
    throw createError({
      statusCode: 400,
      message: '页面路径不能为空'
    })
  }

  // 获取当前用户（可选）
  const currentUser = await getCurrentUser(event)
  const userId = currentUser?.userId || null

  // 获取IP地址
  const ip = getClientIP(event) || null

  // 创建页面访问记录
  await prisma.page_view.create({
    data: {
      user_id: userId ? BigInt(userId) : null,
      page_path: pagePath,
      referrer: referrer || null,
      user_agent: userAgent || null,
      device_type: device || 'web',
      platform: 'web',
      ip_address: ip,
      stay_duration: duration || 0
    }
  })

  return {
    code: 200,
    message: '统计成功'
  }
})

