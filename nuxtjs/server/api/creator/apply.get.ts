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

  // 获取用户的申请记录
  const application = await prisma.creator_application.findUnique({
    where: { user_id: userId }
  })

  if (!application) {
    return {
      code: 200,
      message: '获取成功',
      data: null
    }
  }

  return {
    code: 200,
    message: '获取成功',
    data: {
      id: Number(application.id),
      qualificationUrls: (application.qualification_urls as string[]) || [],
      socialPlatforms: ((application as any).social_platforms as string[]) || [],
      socialAccount: (application as any).social_account || '',
      status: application.status,
      rejectReason: application.reject_reason,
      createdAt: application.created_at.toISOString(),
      updatedAt: application.updated_at.toISOString()
    }
  }
})

