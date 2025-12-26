import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import mysql from 'mysql2/promise'

dotenv.config()

async function testDatabase() {
  const dbUrl = process.env.DATABASE_URL
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL 环境变量未设置')
    console.log('\n请在 .env 文件中设置 DATABASE_URL，格式：')
    console.log('DATABASE_URL="mysql://用户名:密码@主机:端口/数据库名"')
    process.exit(1)
  }

  console.log('开始测试数据库连接...\n')
  console.log('数据库连接信息：')
  
  // 解析并显示连接信息（隐藏密码）
  try {
    const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+?)(\?|$)/)
    if (urlMatch) {
      const [, user, password, host, port, database] = urlMatch
      console.log(`  主机: ${host || '未知'}`)
      console.log(`  端口: ${port || '未知'}`)
      console.log(`  用户: ${user || '未知'}`)
      console.log(`  密码: ${password ? '*'.repeat(password.length) : '****'}`)
      console.log(`  数据库: ${database || '未知'}`)
    } else {
      console.log(`  URL: ${dbUrl.replace(/:[^:@]+@/, ':****@')}`)
    }
  } catch (e) {
    console.log(`  URL: ${dbUrl.replace(/:[^:@]+@/, ':****@')}`)
  }

  console.log('\n')

  // 测试1: 检查数据库是否存在，不存在则创建
  console.log('测试 1: 检查数据库是否存在...')
  let database = ''
  let baseUrl = ''
  
  try {
    // 从 DATABASE_URL 中提取数据库名和基础连接信息
    const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+?)(\?|$)/)
    if (!urlMatch) {
      throw new Error('无法解析 DATABASE_URL')
    }

    const [, user, password, host, port, dbName] = urlMatch
    if (!dbName || !user || !password || !host || !port) {
      throw new Error('DATABASE_URL 格式不正确，缺少必要信息')
    }
    database = dbName
    baseUrl = `mysql://${user}:${password}@${host}:${port}`

    // 使用原生 MySQL 连接来创建数据库（避免 Prisma prepared statement 限制）
    console.log(`  正在检查/创建数据库 "${database}"...`)
    
    const connection = await mysql.createConnection({
      host: host,
      port: parseInt(port),
      user: user,
      password: password
    })

    try {
      // 直接执行 CREATE DATABASE（MySQL 5.7 兼容）
      await connection.execute(
        `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      )
      
      // 验证数据库是否创建成功
      const [databases] = await connection.execute('SHOW DATABASES')
      
      const dbExists = (databases as any[]).some((row: any) => {
        const dbName = Array.isArray(row) ? row[0] : (row.Database || Object.values(row)[0])
        return dbName === database
      })

      if (dbExists) {
        console.log(`  ✓ 数据库 "${database}" 已存在或创建成功`)
      } else {
        console.log(`  ⚠ 数据库创建可能失败，请检查权限`)
      }
    } finally {
      await connection.end()
    }
  } catch (error: any) {
    console.log(`  ❌ 检查/创建数据库时出错: ${error.message}`)
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      console.log(`  无法连接到数据库服务器，请检查网络连接和服务器状态`)
      process.exit(1)
    }
  }

  console.log('\n')

  // 测试2: 测试 Prisma 连接
  console.log('测试 2: 测试 Prisma 连接...')
  const prisma = new PrismaClient({
    log: ['error', 'warn']
  })

  try {
    // 尝试执行一个简单查询
    await prisma.$connect()
    console.log('  ✓ Prisma 连接成功')

    // 测试查询（检查是否有表）
    try {
      const tables = await prisma.$queryRawUnsafe<Array<{ Tables_in_database: string }>>(
        'SHOW TABLES'
      )
      
      if (tables.length > 0) {
        console.log(`  ✓ 数据库中有 ${tables.length} 个表`)
        console.log('  表列表:')
        tables.forEach((table, index) => {
          const tableName = Object.values(table)[0]
          console.log(`    ${index + 1}. ${tableName}`)
        })
      } else {
        console.log('  ⚠ 数据库中没有表')
        console.log('  提示: 运行 npm run db:reset 初始化数据库结构')
      }
    } catch (error: any) {
      if (error.message.includes('Unknown database')) {
        console.log('  ⚠ 数据库不存在，需要先创建')
      } else {
        console.log(`  ⚠ 查询表时出错: ${error.message}`)
      }
    }

    // 测试查询用户表（如果存在）
    try {
      const userCount = await prisma.user.count()
      console.log(`  ✓ 用户表存在，当前有 ${userCount} 个用户`)
    } catch (error: any) {
      if (error.message.includes("doesn't exist")) {
        console.log('  ⚠ 用户表不存在')
      } else {
        console.log(`  ⚠ 查询用户表时出错: ${error.message}`)
      }
    }

  } catch (error: any) {
    console.log(`  ❌ Prisma 连接失败: ${error.message}`)
    
    if (error.message.includes('Unknown database')) {
      console.log('\n  检测到数据库不存在，尝试自动创建...')
      
      // 尝试创建数据库
      if (database && baseUrl) {
        try {
          const adminPrisma = new PrismaClient({
            datasources: {
              db: {
                url: baseUrl
              }
            }
          })

          try {
            await adminPrisma.$executeRawUnsafe(
              `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
            )
            console.log(`  ✓ 数据库 "${database}" 创建成功`)
            console.log('  请重新运行测试或运行 npm run db:reset 初始化表结构')
          } finally {
            await adminPrisma.$disconnect()
          }
        } catch (createError: any) {
          console.log(`  ❌ 创建数据库失败: ${createError.message}`)
          console.log('\n  解决方案:')
          console.log('  1. 手动创建数据库')
          console.log('  2. 或运行 npm run db:reset 自动创建数据库和表结构')
        }
      } else {
        console.log('\n  解决方案:')
        console.log('  1. 手动创建数据库')
        console.log('  2. 或运行 npm run db:reset 自动创建数据库和表结构')
      }
    } else if (error.message.includes('Access denied')) {
      console.log('\n  解决方案:')
      console.log('  1. 检查 DATABASE_URL 中的用户名和密码是否正确')
      console.log('  2. 确认数据库用户有足够的权限（需要 CREATE DATABASE 权限）')
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      console.log('\n  解决方案:')
      console.log('  1. 检查数据库主机和端口是否正确')
      console.log('  2. 确认数据库服务是否正在运行')
      console.log('  3. 检查网络连接和防火墙设置')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }

  console.log('\n✅ 数据库连接测试完成！')
}

testDatabase()
  .catch((error) => {
    console.error('\n❌ 测试过程中出现错误:', error)
    process.exit(1)
  })

