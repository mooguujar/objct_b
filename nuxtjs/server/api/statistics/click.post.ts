import prisma from '../../utils/prisma'
import { getCurrentUser } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { elementId, elementType, pagePath, content } = body

  if (!elementId || !elementType || !pagePath) {
    throw createError({
      statusCode: 400,
      message: '元素ID、元素类型和页面路径不能为空'
    })
  }

  // 获取当前用户（可选）
  const currentUser = await getCurrentUser(event)
  const userId = currentUser?.userId || null

  // 创建点击事件记录
  await prisma.click_event.create({
    data: {
      user_id: userId ? BigInt(userId) : null,
      element_id: elementId,
      element_type: elementType,
      page_path: pagePath,
      event_type: elementType,
      ip_address: getClientIP(event) || null
    }
  })

  return {
    code: 200,
    message: '统计成功'
  }
})

