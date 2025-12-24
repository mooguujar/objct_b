import prisma from '~/server/utils/prisma'
import { comparePassword } from '~/server/utils/password'
import { generateToken } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body
  const config = useRuntimeConfig(event)

  // 验证必填字段
  if (!username || !password) {
    throw createError({
      statusCode: 400,
      message: '用户名和密码不能为空'
    })
  }

  // 查找用户（支持用户名、邮箱、手机号登录）
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { email: username },
        { phone: username }
      ]
    }
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      message: '用户名或密码错误'
    })
  }

  // 检查用户状态
  if (user.status !== 'active') {
    throw createError({
      statusCode: 403,
      message: '账号已被禁用或删除'
    })
  }

  // 验证密码
  const isPasswordValid = await comparePassword(password, user.password_hash)
  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      message: '用户名或密码错误'
    })
  }

  // 生成Token
  const token = generateToken(
    { userId: Number(user.id), username: user.username },
    { secret: config.jwtSecret, expiresIn: config.jwtExpiresIn }
  )

  // 返回用户信息（不包含密码）
  const { password_hash: _, ...userWithoutPassword } = user

  return {
    code: 200,
    message: '登录成功',
    data: {
      user: {
        ...userWithoutPassword,
        id: Number(user.id)
      },
      token
    }
  }
})

