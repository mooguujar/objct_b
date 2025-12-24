import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('数据库中的用户列表（可用于登录）：\n')
    console.log('=' .repeat(80))
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        status: true
      },
      where: {
        status: 'active'
      },
      orderBy: [
        { role: 'asc' },
        { username: 'asc' }
      ]
    })
    
    if (users.length === 0) {
      console.log('没有可用的用户')
      return
    }
    
    // 按角色分组显示
    const adminUsers = users.filter(u => u.role === 'admin')
    const creatorUsers = users.filter(u => u.role === 'creator')
    const normalUsers = users.filter(u => u.role === 'user')
    
    console.log('\n【管理员用户】')
    if (adminUsers.length > 0) {
      adminUsers.forEach(user => {
        console.log(`  用户名: ${user.username.padEnd(20)} 邮箱: ${user.email || '未设置'}`)
      })
    } else {
      console.log('  无')
    }
    
    console.log('\n【创作者用户】')
    if (creatorUsers.length > 0) {
      creatorUsers.forEach(user => {
        console.log(`  用户名: ${user.username.padEnd(20)} 邮箱: ${user.email || '未设置'}`)
      })
    } else {
      console.log('  无')
    }
    
    console.log('\n【普通用户】')
    if (normalUsers.length > 0) {
      normalUsers.forEach(user => {
        console.log(`  用户名: ${user.username.padEnd(20)} 邮箱: ${user.email || '未设置'}`)
      })
    } else {
      console.log('  无')
    }
    
    console.log('\n' + '='.repeat(80))
    console.log('\n提示：')
    console.log('- 默认测试密码通常是: 123456')
    console.log('- 如果无法登录，请检查密码是否正确或联系管理员')
    console.log(`- 共找到 ${users.length} 个可用用户`)
    
  } catch (error) {
    console.error('查询用户时出错:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

