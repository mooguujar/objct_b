import prisma from '../../../utils/prisma'
import { getCurrentUser } from '../../../utils/jwt'

export default defineEventHandler(async (event) => {
  const islandId = getRouterParam(event, 'id')
  if (!islandId) {
    throw createError({
      statusCode: 400,
      message: '岛屿ID不能为空'
    })
  }

  // 获取当前用户（必须登录）
  const currentUser = await getCurrentUser(event)
  if (!currentUser?.userId) {
    throw createError({
      statusCode: 401,
      message: '请先登录'
    })
  }

  const userId = BigInt(currentUser.userId)
  const islandIdBigInt = BigInt(islandId)

  // 检查岛屿是否存在
  const island = await prisma.island.findUnique({
    where: {
      id: islandIdBigInt
    }
  })

  if (!island) {
    throw createError({
      statusCode: 404,
      message: '岛屿不存在'
    })
  }

  // 检查用户是否已加入
  const existingMember = await prisma.island_member.findUnique({
    where: {
      user_id_island_id: {
        user_id: userId,
        island_id: islandIdBigInt
      }
    }
  })

  if (existingMember) {
    throw createError({
      statusCode: 400,
      message: '您已经加入该岛屿'
    })
  }

  // 检查用户金币余额
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      coin_balance: true
    }
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      message: '用户不存在'
    })
  }

  const price = Number(island.price)
  const userBalance = Number(user.coin_balance)

  if (price > 0 && userBalance < price) {
    throw createError({
      statusCode: 400,
      message: `金币不足，需要 ${price} 金币，当前余额 ${userBalance} 金币`
    })
  }

  // 加入岛屿（使用事务）
  await prisma.$transaction(async (tx) => {
    // 创建岛屿成员记录
    await tx.island_member.create({
      data: {
        user_id: userId,
        island_id: islandIdBigInt,
        join_type: price > 0 ? 'paid' : 'free',
        paid_amount: price
      }
    })

    // 更新岛屿成员数
    await tx.island.update({
      where: {
        id: islandIdBigInt
      },
      data: {
        member_count: {
          increment: 1
        }
      }
    })

    // 如果付费，扣除金币并记录交易
    if (price > 0) {
      await tx.user.update({
        where: {
          id: userId
        },
        data: {
          coin_balance: {
            decrement: price
          }
        }
      })

      await tx.coin_transaction.create({
        data: {
          user_id: userId,
          type: 'consume',
          amount: -price,
          balance: userBalance - price,
          description: `加入岛屿：${island.name}`,
          related_id: islandIdBigInt,
          related_type: 'island'
        }
      })
    }
  })

  return {
    code: 200,
    message: '加入成功',
    data: {
      islandId: Number(islandIdBigInt),
      joinType: price > 0 ? 'paid' : 'free',
      paidAmount: price
    }
  }
})

