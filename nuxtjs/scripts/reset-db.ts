import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import dotenv from 'dotenv'
import { existsSync, rmSync } from 'fs'
import { join } from 'path'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('开始重置数据库...\n')

    // 1. 删除所有表（通过 Prisma migrate reset）
    console.log('步骤 1: 删除所有表...')
    try {
      execSync('npx prisma migrate reset --force --skip-seed', {
        stdio: 'inherit',
        cwd: process.cwd()
      })
      console.log('✓ 所有表已删除\n')
    } catch (error) {
      console.log('使用备用方案：直接删除数据库并重新创建...')
      
      // 备用方案：手动删除并重新创建数据库
      const dbUrl = process.env.DATABASE_URL
      if (!dbUrl) {
        throw new Error('DATABASE_URL 环境变量未设置')
      }

      // 从 DATABASE_URL 中提取数据库名
      const dbNameMatch = dbUrl.match(/\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)(\?|$)/)
      if (!dbNameMatch) {
        throw new Error('无法解析 DATABASE_URL')
      }

      const dbName = dbNameMatch[5]
      const baseUrl = dbUrl.replace(`/${dbName}`, '')

      // 连接到默认数据库并删除目标数据库
      const adminPrisma = new PrismaClient({
        datasources: {
          db: {
            url: baseUrl
          }
        }
      })

      try {
        await adminPrisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS \`${dbName}\``)
        console.log(`✓ 数据库 ${dbName} 已删除`)
        
        await adminPrisma.$executeRawUnsafe(`CREATE DATABASE \`${dbName}\``)
        console.log(`✓ 数据库 ${dbName} 已创建`)
      } finally {
        await adminPrisma.$disconnect()
      }
    }

    // 2. 运行迁移
    console.log('\n步骤 2: 运行数据库迁移...')
    try {
      execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        cwd: process.cwd()
      })
      console.log('✓ 数据库迁移完成\n')
    } catch (error) {
      // 如果没有迁移文件，使用 prisma db push
      console.log('使用 prisma db push 同步数据库结构...')
      execSync('npx prisma db push --accept-data-loss', {
        stdio: 'inherit',
        cwd: process.cwd()
      })
      console.log('✓ 数据库结构同步完成\n')
    }

    // 3. 生成 Prisma Client
    console.log('步骤 3: 生成 Prisma Client...')
    
    // Windows 权限问题处理：先删除旧的 .prisma 目录
    const prismaClientPath = join(process.cwd(), 'node_modules', '.prisma', 'client')
    if (existsSync(prismaClientPath)) {
      try {
        console.log('清理旧的 Prisma Client 文件...')
        rmSync(prismaClientPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 1000 })
      } catch (error) {
        console.warn('⚠️  无法删除旧的 Prisma Client 文件，可能被其他进程占用')
        console.warn('   请关闭所有运行中的开发服务器和 Node 进程后重试')
      }
    }
    
    // 重试机制
    let retries = 3
    let success = false
    while (retries > 0 && !success) {
      try {
        execSync('npx prisma generate', {
          stdio: 'inherit',
          cwd: process.cwd()
        })
        success = true
        console.log('✓ Prisma Client 已生成\n')
      } catch (error: any) {
        retries--
        if (retries > 0) {
          console.log(`生成失败，${retries} 次重试机会...`)
          await new Promise(resolve => setTimeout(resolve, 2000))
        } else {
          console.error('\n❌ Prisma Client 生成失败')
          console.error('可能的原因：')
          console.error('1. 文件被其他进程占用（开发服务器、IDE 等）')
          console.error('2. 防病毒软件阻止了文件操作')
          console.error('3. 文件权限不足')
          console.error('\n解决方案：')
          console.error('1. 关闭所有运行中的开发服务器（npm run dev）')
          console.error('2. 关闭 VS Code 或其他 IDE')
          console.error('3. 在任务管理器中结束所有 node.exe 进程')
          console.error('4. 手动运行: npx prisma generate')
          throw error
        }
      }
    }

    console.log('✅ 数据库重置完成！')
    console.log('\n下一步：运行 npm run seed 创建测试数据')

  } catch (error) {
    console.error('❌ 重置数据库时出错:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

