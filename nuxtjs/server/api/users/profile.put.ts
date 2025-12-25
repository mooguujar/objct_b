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

  // 获取当前用户信息，检查性别是否已设置
  const currentUserInfo = await prisma.user.findUnique({
    where: { id: userId },
    select: { gender: true }
  })

  // 构建更新数据
  const updateData: any = {
    updated_at: new Date()
  }

  if (body.nickname !== undefined) {
    updateData.nickname = body.nickname
  }

  if (body.avatar !== undefined) {
    updateData.avatar = body.avatar
  }

  if (body.backgroundImage !== undefined) {
    updateData.background_image = body.backgroundImage
  }

  if (body.birthday !== undefined) {
    updateData.birthday = body.birthday ? new Date(body.birthday) : null
  }

  // 性别只能修改一次
  if (body.gender !== undefined) {
    // 如果当前性别为0（未选择）或null，允许设置
    if (!currentUserInfo?.gender || currentUserInfo.gender === 0) {
      updateData.gender = body.gender
    } else {
      throw createError({
        statusCode: 400,
        message: '性别只能修改一次，请谨慎修改'
      })
    }
  }

  // 更新用户信息
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
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
      updated_at: true
    }
  })

  return {
    code: 200,
    message: '更新成功',
    data: {
      id: Number(updatedUser.id),
      username: updatedUser.username,
      nickname: updatedUser.nickname,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      backgroundImage: updatedUser.background_image,
      gender: updatedUser.gender,
      birthday: updatedUser.birthday ? updatedUser.birthday.toISOString().split('T')[0] : null,
      phone: updatedUser.phone,
      email: updatedUser.email,
      updatedAt: updatedUser.updated_at.toISOString()
    }
  }
})

