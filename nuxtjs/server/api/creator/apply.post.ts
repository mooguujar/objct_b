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

  // 验证必填字段
  if (!body.qualificationUrls || !Array.isArray(body.qualificationUrls) || body.qualificationUrls.length === 0) {
    throw createError({
      statusCode: 400,
      message: '至少需要上传1张截图'
    })
  }

  if (body.qualificationUrls.length > 9) {
    throw createError({
      statusCode: 400,
      message: '最多只能上传9张截图'
    })
  }

  if (!body.socialPlatforms || !Array.isArray(body.socialPlatforms) || body.socialPlatforms.length === 0) {
    throw createError({
      statusCode: 400,
      message: '请至少选择一个社交平台'
    })
  }

  if (!body.socialAccount || !body.socialAccount.trim()) {
    throw createError({
      statusCode: 400,
      message: '请填写社媒平台账号'
    })
  }

  // 检查是否已有申请记录
  const existingApplication = await prisma.creator_application.findUnique({
    where: { user_id: userId }
  })

  const applicationData: any = {
    qualification_urls: body.qualificationUrls,
    social_platforms: body.socialPlatforms,
    social_account: body.socialAccount.trim(),
    updated_at: new Date()
  }

  if (existingApplication) {
    // 更新现有申请
    if (existingApplication.status === 'pending') {
      throw createError({
        statusCode: 400,
        message: '您已有待审核的申请，请等待审核结果'
      })
    }
    
    // 如果之前被拒绝，可以重新提交
    const updated = await prisma.creator_application.update({
      where: { user_id: userId },
      data: {
        ...applicationData,
        status: 'pending',
        reject_reason: null,
        reviewed_by: null,
        reviewed_at: null
      }
    })

    return {
      code: 200,
      message: '申请已重新提交',
      data: {
        id: Number(updated.id),
        status: updated.status
      }
    }
  } else {
    // 创建新申请
    const created = await prisma.creator_application.create({
      data: {
        user_id: userId,
        ...applicationData
      }
    })

    return {
      code: 200,
      message: '申请提交成功',
      data: {
        id: Number(created.id),
        status: created.status
      }
    }
  }
})

