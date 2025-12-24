import prisma from '~/server/utils/prisma'
import { hashPassword } from '~/server/utils/password'
import { generateToken } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, email, password, phone } = body
  const config = useRuntimeConfig(event)

  // 验证必填字段
  if (!username || !password) {
    throw createError({
      statusCode: 400,
      message: '用户名和密码不能为空'
    })
  }

  // 验证密码长度
  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      message: '密码长度不能少于6位'
    })
  }

  // 检查用户是否已存在
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : [])
      ]
    }
  })

  if (existingUser) {
    throw createError({
      statusCode: 400,
      message: '用户名、邮箱或手机号已存在'
    })
  }

  // 加密密码
  const hashedPassword = await hashPassword(password)

  // 创建用户
  const user = await prisma.user.create({
    data: {
      username,
      nickname: username,
      email: email || null,
      phone: phone || null,
      password_hash: hashedPassword,
      role: 'user'
    }
  })

  // 生成Token
  const token = generateToken(
    { userId: Number(user.id), username: user.username },
    { secret: config.jwtSecret, expiresIn: config.jwtExpiresIn }
  )

  // 返回用户信息（不包含密码）
  const { password_hash: _, ...userWithoutPassword } = user

  return {
    code: 200,
    message: '注册成功',
    data: {
      user: {
        ...userWithoutPassword,
        id: Number(user.id)
      },
      token
    }
  }
})

