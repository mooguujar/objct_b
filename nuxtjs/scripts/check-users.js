const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('查询数据库中的用户...\n')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })
    
    if (users.length === 0) {
      console.log('数据库中没有用户数据')
      return
    }
    
    console.log(`找到 ${users.length} 个用户：\n`)
    console.log('用户名\t\t邮箱\t\t\t手机号\t\t角色\t状态\t创建时间')
    console.log('-'.repeat(100))
    
    users.forEach(user => {
      console.log(
        `${user.username.padEnd(16)}\t` +
        `${(user.email || '未设置').padEnd(20)}\t` +
        `${(user.phone || '未设置').padEnd(12)}\t` +
        `${user.role.padEnd(8)}\t` +
        `${user.status.padEnd(8)}\t` +
        `${user.created_at}`
      )
    })
    
    console.log('\n可用登录的用户（状态为 active）：')
    const activeUsers = users.filter(user => user.status === 'active')
    if (activeUsers.length === 0) {
      console.log('没有可用的用户（所有用户状态都不是 active）')
    } else {
      activeUsers.forEach(user => {
        console.log(`- ${user.username} (${user.role})`)
      })
    }
    
  } catch (error) {
    console.error('查询用户时出错:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

