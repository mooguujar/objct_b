import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../server/utils/password'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

// 生成真实可用的图片 URL
function getAvatarUrl(seed: number, size: number = 200): string {
  // 使用 Picsum Photos 生成随机头像
  return `https://picsum.photos/seed/avatar${seed}/${size}/${size}`
}

function getBackgroundUrl(seed: number, width: number = 1200, height: number = 400): string {
  // 使用 Picsum Photos 生成随机背景图
  return `https://picsum.photos/seed/bg${seed}/${width}/${height}`
}

function getPostImageUrl(seed: number, width: number = 800, height: number = 600): string {
  // 使用 Picsum Photos 生成随机帖子图片
  return `https://picsum.photos/seed/post${seed}/${width}/${height}`
}

function getIslandCoverUrl(seed: number, width: number = 1200, height: number = 400): string {
  // 使用 Picsum Photos 生成岛屿封面
  return `https://picsum.photos/seed/island${seed}/${width}/${height}`
}

function getIslandAvatarUrl(seed: number, size: number = 200): string {
  // 使用 Picsum Photos 生成岛屿头像
  return `https://picsum.photos/seed/island-avatar${seed}/${size}/${size}`
}

async function main() {
  try {
    console.log('开始创建测试数据...\n')

    // 检查数据库表是否存在
    try {
      await prisma.$queryRawUnsafe('SELECT 1 FROM `user` LIMIT 1')
    } catch (error: any) {
      if (error.message.includes("doesn't exist") || error.code === 'P2021') {
        console.error('❌ 数据库表不存在！')
        console.error('\n请先运行数据库迁移来创建表结构：')
        console.error('  npm run db:reset')
        console.error('  或')
        console.error('  npm run db:migrate')
        console.error('\n这将创建所有必需的数据表。')
        process.exit(1)
      }
      throw error
    }

    // 清空现有数据（避免重复数据冲突）
    console.log('清空现有测试数据...')
    try {
      // 禁用外键检查
      await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0')
      
      // 按依赖关系顺序删除数据
      await prisma.$executeRawUnsafe('TRUNCATE TABLE `notification`')
      await prisma.$executeRawUnsafe('TRUNCATE TABLE `user_behavior`')
      await prisma.$executeRawUnsafe('TRUNCATE TABLE `page_view`')
      await prisma.$executeRawUnsafe('TRUNCATE TABLE `click_event`')
      await prisma.$executeRawUnsafe('TRUNCATE TABLE `coin_transaction`')
      await prisma.$executeRawUnsafe('TRUNCATE TABLE `comment_like`')
      await prisma.$executeRawUnsafe('TRUNCATE TABLE `comment`')
      await prisma.$executeRawUnsafe('TRUNCATE TABLE `post_like`')
      await prisma.$executeRawUnsafe('TRUNCATE TABLE `post_collect`')
      await prisma.$executeRawUnsafe('TRUNCATE TABLE `post`')
      await prisma.$executeRawUnsafe('TRUNCATE TABLE `island_member`')
      await prisma.$executeRawUnsafe('TRUNCATE TABLE `island`')
      await prisma.$executeRawUnsafe('TRUNCATE TABLE `follow`')
      await prisma.$executeRawUnsafe('TRUNCATE TABLE `creator_application`')
      await prisma.$executeRawUnsafe('TRUNCATE TABLE `user`')
      
      // 重新启用外键检查
      await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1')
      console.log('✓ 现有数据已清空\n')
    } catch (error: any) {
      console.warn('⚠️  清空数据时出错，继续创建数据:', error.message)
      console.warn('   如果遇到唯一约束错误，请手动清空数据或运行 npm run db:reset\n')
    }

    const testPassword = await hashPassword('123456')

    // 1. 创建用户数据
    console.log('创建用户数据...')
    
    // 普通用户（10个）
    const normalUsers = []
    for (let i = 1; i <= 10; i++) {
      const user = await prisma.user.create({
        data: {
          username: `user${i}`,
          nickname: `普通用户${i}`,
          email: `user${i}@test.com`,
          phone: `1380000${String(i).padStart(4, '0')}`,
          password_hash: testPassword,
          role: 'user',
          bio: `这是第${i}个普通用户的简介`,
          avatar: getAvatarUrl(i),
          background_image: getBackgroundUrl(i),
          coin_balance: 100 + i * 10,
          updated_at: new Date()
        }
      })
      normalUsers.push(user)
      console.log(`  ✓ 创建用户: ${user.username}`)
    }

    // 创作者用户（5个）
    const creatorUsers = []
    for (let i = 1; i <= 5; i++) {
      const user = await prisma.user.create({
        data: {
          username: `creator${i}`,
          nickname: `创作者${i}`,
          email: `creator${i}@test.com`,
          phone: `1390000${String(i).padStart(4, '0')}`,
          password_hash: testPassword,
          role: 'creator',
          bio: `这是第${i}个创作者的简介`,
          avatar: getAvatarUrl(10 + i),
          background_image: getBackgroundUrl(10 + i),
          coin_balance: 500 + i * 50,
          is_verified: i <= 2, // 前2个创作者已验证
          updated_at: new Date()
        }
      })
      creatorUsers.push(user)
      console.log(`  ✓ 创建创作者: ${user.username}`)
    }

    // 岛屿创建者（3个，同时也是创作者）
    const islandOwners = []
    for (let i = 1; i <= 3; i++) {
      const user = await prisma.user.create({
        data: {
          username: `islandowner${i}`,
          nickname: `岛屿主${i}`,
          email: `islandowner${i}@test.com`,
          phone: `1370000${String(i).padStart(4, '0')}`,
          password_hash: testPassword,
          role: 'creator',
          bio: `这是第${i}个岛屿创建者的简介`,
          avatar: getAvatarUrl(15 + i),
          background_image: getBackgroundUrl(15 + i),
          coin_balance: 1000 + i * 100,
          is_verified: true,
          updated_at: new Date()
        }
      })
      islandOwners.push(user)
      console.log(`  ✓ 创建岛屿主: ${user.username}`)
    }

    // 管理员用户（1个）
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        nickname: '管理员',
        email: 'admin@test.com',
        phone: '13800000000',
        password_hash: testPassword,
        role: 'admin',
        bio: '系统管理员',
        avatar: getAvatarUrl(99),
        background_image: getBackgroundUrl(99),
        coin_balance: 9999,
        is_verified: true,
        updated_at: new Date()
      }
    })
    console.log(`  ✓ 创建管理员: ${adminUser.username}`)

    console.log(`\n✓ 共创建 ${normalUsers.length + creatorUsers.length + islandOwners.length + 1} 个用户\n`)

    // 2. 创建岛屿数据（5个不同分类）
    console.log('创建岛屿数据...')
    const categories = ['科技', '生活', '娱乐', '学习', '运动']
    const islands = []
    
    for (let i = 0; i < 5; i++) {
      const owner = islandOwners[i % islandOwners.length]
      const island = await prisma.island.create({
        data: {
          name: `${categories[i]}岛屿${i + 1}`,
          description: `这是一个关于${categories[i]}的岛屿，欢迎加入！`,
          category: categories[i],
          owner_id: owner.id,
          cover: getIslandCoverUrl(i + 1),
          avatar: getIslandAvatarUrl(i + 1),
          price: i < 2 ? 0 : (i - 1) * 10, // 前2个免费，后面的付费
          member_count: 0,
          post_count: 0,
          status: 'active',
          is_verified: i < 3,
          updated_at: new Date()
        }
      })
      islands.push(island)
      console.log(`  ✓ 创建岛屿: ${island.name} (${island.category})`)
    }

    // 添加岛屿成员
    for (const island of islands) {
      // 岛屿主自动加入
      await prisma.island_member.create({
        data: {
          user_id: island.owner_id,
          island_id: island.id,
          join_type: 'free',
          updated_at: new Date()
        }
      })

      // 添加一些普通用户作为成员
      const membersToAdd = normalUsers.slice(0, 3 + Math.floor(Math.random() * 3))
      for (const user of membersToAdd) {
        await prisma.island_member.create({
          data: {
            user_id: user.id,
            island_id: island.id,
            join_type: island.price > 0 ? 'paid' : 'free',
            paid_amount: island.price,
            updated_at: new Date()
          }
        })
      }

      // 更新成员数
      await prisma.island.update({
        where: { id: island.id },
        data: {
          member_count: membersToAdd.length + 1
        }
      })
    }
    console.log(`\n✓ 共创建 ${islands.length} 个岛屿\n`)

    // 3. 创建帖子数据
    console.log('创建帖子数据...')
    const allUsers = [...normalUsers, ...creatorUsers, ...islandOwners]
    const posts = []

    // 普通帖子（10条）- 全部必须有图片或视频
    for (let i = 1; i <= 10; i++) {
      const author = allUsers[Math.floor(Math.random() * allUsers.length)]
      // 交替生成图片和视频，确保都有 media_urls
      const isImage = i % 2 === 0
      const isVideo = i % 2 === 1
      // 所有帖子都必须有 media_urls
      const mediaUrls: string[] = isImage 
        ? [getPostImageUrl(i)] 
        : [getPostImageUrl(i + 100)]
      
      const post = await prisma.post.create({
        data: {
          user_id: author.id,
          title: `测试帖子标题 ${i}`,
          content: `这是第${i}条测试帖子的内容。包含一些示例文本，用于测试系统功能。`,
          media_type: isImage ? 'image' : 'video',
          media_urls: mediaUrls,
          status: 'active',
          like_count: 0,
          comment_count: 0,
          view_count: Math.floor(Math.random() * 1000),
          updated_at: new Date()
        }
      })
      posts.push(post)
      console.log(`  ✓ 创建帖子: ${post.title} (${isImage ? '图片' : '视频'})`)
    }

    // 岛屿帖子（9条）- 全部必须有图片
    for (let i = 1; i <= 9; i++) {
      const author = allUsers[Math.floor(Math.random() * allUsers.length)]
      const island = islands[Math.floor(Math.random() * islands.length)]
      // 所有岛屿帖子都必须有图片
      const mediaUrls: string[] = [getPostImageUrl(i + 200)]
      const post = await prisma.post.create({
        data: {
          user_id: author.id,
          island_id: island.id,
          title: `岛屿帖子 ${i} - ${island.name}`,
          content: `这是发布在${island.name}的第${i}条帖子。`,
          media_type: 'image',
          media_urls: mediaUrls,
          status: 'active',
          like_count: 0,
          comment_count: 0,
          view_count: Math.floor(Math.random() * 500),
          updated_at: new Date()
        }
      })
      posts.push(post)

      // 更新岛屿帖子数
      await prisma.island.update({
        where: { id: island.id },
        data: {
          post_count: { increment: 1 }
        }
      })
      console.log(`  ✓ 创建岛屿帖子: ${post.title}`)
    }

    console.log(`\n✓ 共创建 ${posts.length} 条帖子\n`)

    // 4. 创建评论数据（10条）
    console.log('创建评论数据...')
    for (let i = 1; i <= 10; i++) {
      const post = posts[Math.floor(Math.random() * posts.length)]
      const author = allUsers[Math.floor(Math.random() * allUsers.length)]
      
      await prisma.comment.create({
        data: {
          post_id: post.id,
          user_id: author.id,
          content: `这是第${i}条评论，对帖子"${post.title}"的回复。`,
          status: 'active',
          updated_at: new Date()
        }
      })

      // 更新帖子评论数
      await prisma.post.update({
        where: { id: post.id },
        data: {
          comment_count: { increment: 1 }
        }
      })
      console.log(`  ✓ 创建评论 ${i}`)
    }
    console.log(`\n✓ 共创建 10 条评论\n`)

    // 5. 创建点赞数据（10条）
    console.log('创建点赞数据...')
    const likedPosts = new Set<string>()
    for (let i = 1; i <= 10; i++) {
      let post, user
      let attempts = 0
      
      // 确保每个帖子最多被一个用户点赞一次
      do {
        post = posts[Math.floor(Math.random() * posts.length)]
        user = allUsers[Math.floor(Math.random() * allUsers.length)]
        attempts++
      } while (likedPosts.has(`${post.id}-${user.id}`) && attempts < 50)

      if (!likedPosts.has(`${post.id}-${user.id}`)) {
        await prisma.post_like.create({
          data: {
            post_id: post.id,
            user_id: user.id
          }
        })

        // 更新帖子点赞数
        await prisma.post.update({
          where: { id: post.id },
          data: {
            like_count: { increment: 1 }
          }
        })

        likedPosts.add(`${post.id}-${user.id}`)
        console.log(`  ✓ 创建点赞 ${i}`)
      }
    }
    console.log(`\n✓ 共创建 ${likedPosts.size} 条点赞数据\n`)

    // 6. 创建关注关系（11条）
    console.log('创建关注关系...')
    const follows = new Set<string>()
    let followCount = 0
    
    while (followCount < 11) {
      const follower = allUsers[Math.floor(Math.random() * allUsers.length)]
      const following = allUsers[Math.floor(Math.random() * allUsers.length)]
      
      // 不能关注自己
      if (follower.id === following.id) continue
      
      const followKey = `${follower.id}-${following.id}`
      if (!follows.has(followKey)) {
        await prisma.follow.create({
          data: {
            follower_id: follower.id,
            following_id: following.id
          }
        })

        // 更新关注数和粉丝数
        await prisma.user.update({
          where: { id: follower.id },
          data: { follow_count: { increment: 1 } }
        })
        await prisma.user.update({
          where: { id: following.id },
          data: { follower_count: { increment: 1 } }
        })

        follows.add(followKey)
        followCount++
        console.log(`  ✓ 创建关注关系 ${followCount}: ${follower.username} -> ${following.username}`)
      }
    }
    console.log(`\n✓ 共创建 ${followCount} 条关注关系\n`)

    // 7. 创建一些通知数据
    console.log('创建通知数据...')
    for (let i = 1; i <= 5; i++) {
      const user = allUsers[Math.floor(Math.random() * allUsers.length)]
      await prisma.notification.create({
        data: {
          user_id: user.id,
          type: i % 2 === 0 ? 'interaction' : 'system',
          title: `测试通知 ${i}`,
          content: `这是第${i}条测试通知的内容`,
          is_read: i % 2 === 0
        }
      })
    }
    console.log(`\n✓ 共创建 5 条通知\n`)

    console.log('\n✅ 测试数据创建完成！')
    console.log('\n登录信息：')
    console.log('  管理员: admin / 123456')
    console.log('  普通用户: user1 ~ user10 / 123456')
    console.log('  创作者: creator1 ~ creator5 / 123456')
    console.log('  岛屿主: islandowner1 ~ islandowner3 / 123456')

  } catch (error) {
    console.error('❌ 创建测试数据时出错:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

