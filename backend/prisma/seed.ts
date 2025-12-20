import { PrismaClient, Prisma } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('开始生成测试数据...')

  // 清理现有数据（可选）
  // await prisma.user.deleteMany({})
  // await prisma.island.deleteMany({})
  // await prisma.post.deleteMany({})

  // 生成用户数据
  const users = []
  const passwordHash = await bcrypt.hash('123456', 10)

  // 普通用户（10个）
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        username: `user${i}`,
        nickname: `用户${i}`,
        passwordHash,
        email: `user${i}@example.com`,
        phone: `1380000000${i.toString().padStart(2, '0')}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`,
        bio: `这是用户${i}的简介`,
        role: 'user',
        status: 'active',
      },
    })
    users.push(user)
    console.log(`创建用户: ${user.nickname}`)
  }

  // 创作者用户（5个）
  const creators = []
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        username: `creator${i}`,
        nickname: `创作者${i}`,
        passwordHash,
        email: `creator${i}@example.com`,
        phone: `1390000000${i.toString().padStart(2, '0')}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=creator${i}`,
        bio: `这是创作者${i}的简介`,
        role: 'creator',
        status: 'active',
        creatorApplication: {
          create: {
            status: 'approved',
            platforms: ['weibo', 'douyin'],
            reason: '优质创作者',
          },
        },
      },
    })
    creators.push(user)
    users.push(user)
    console.log(`创建创作者: ${user.nickname}`)
  }

  // 岛屿创建者（3个，从创作者中选择）
  const islandOwners = creators.slice(0, 3)

  // 生成岛屿数据（10个，不同分类）
  const categories = ['财经', '体育', '颜值', '游戏', '美食', '旅行', '科技', '音乐', '电影', '读书']
  const islands = []

  for (let i = 0; i < 10; i++) {
    const owner = islandOwners[i % islandOwners.length]
    const island = await prisma.island.create({
      data: {
        name: `${categories[i]}岛屿${i + 1}`,
        description: `这是一个关于${categories[i]}的岛屿，欢迎加入！`,
        category: categories[i],
        avatar: `https://picsum.photos/200/200?random=${i + 100}`,
        cover: `https://picsum.photos/800/400?random=${i + 200}`,
        ownerId: owner.id,
        price: i < 3 ? new Prisma.Decimal(Math.floor(Math.random() * 100) + 10) : new Prisma.Decimal(0),
        status: 'active',
        isVerified: i < 3,
      },
    })
    islands.push(island)
    console.log(`创建岛屿: ${island.name}`)
  }

  // 生成关注关系（50条）
  for (let i = 0; i < 50; i++) {
    const follower = users[Math.floor(Math.random() * users.length)]
    const following = users[Math.floor(Math.random() * users.length)]
    
    if (follower.id !== following.id) {
      try {
        await prisma.follow.create({
          data: {
            followerId: follower.id,
            followingId: following.id,
          },
        })
        
        // 更新关注数和粉丝数
        await Promise.all([
          prisma.user.update({
            where: { id: follower.id },
            data: { followCount: { increment: 1 } },
          }),
          prisma.user.update({
            where: { id: following.id },
            data: { followerCount: { increment: 1 } },
          }),
        ])
      } catch (e) {
        // 忽略重复关注关系
      }
    }
  }
  console.log('创建关注关系: 50条')

  // 生成帖子数据（50条）
  const posts = []
  const mediaTypes = ['text', 'image', 'video', 'mixed']
  
  for (let i = 0; i < 50; i++) {
    const author = users[Math.floor(Math.random() * users.length)]
    const mediaType = mediaTypes[Math.floor(Math.random() * mediaTypes.length)]
    
    const mediaUrls = mediaType !== 'text' 
      ? [
          `https://picsum.photos/800/600?random=${i + 300}`,
          ...(mediaType === 'mixed' ? [`https://picsum.photos/800/600?random=${i + 400}`] : [])
        ]
      : null

    const post = await prisma.post.create({
      data: {
        userId: author.id,
        title: `帖子标题${i + 1}`,
        content: `这是帖子${i + 1}的内容，包含了一些有趣的文字描述。`,
        mediaType: mediaType as any,
        mediaUrls: mediaUrls as any,
        status: 'active',
        likeCount: 0,
        commentCount: 0,
        viewCount: Math.floor(Math.random() * 1000),
      },
    })
    posts.push(post)
    
    // 更新用户发帖数
    await prisma.user.update({
      where: { id: author.id },
      data: { postCount: { increment: 1 } },
    })
  }
  console.log('创建帖子: 50条')

  // 生成岛屿帖子（100条）
  const islandPosts = []
  for (let i = 0; i < 100; i++) {
    const island = islands[Math.floor(Math.random() * islands.length)]
    const author = users[Math.floor(Math.random() * users.length)]
    const mediaType = mediaTypes[Math.floor(Math.random() * mediaTypes.length)]
    
    const mediaUrls = mediaType !== 'text'
      ? [`https://picsum.photos/800/600?random=${i + 500}`]
      : null

    const post = await prisma.post.create({
      data: {
        userId: author.id,
        islandId: island.id,
        title: `${island.name}的帖子${i + 1}`,
        content: `这是${island.name}的帖子${i + 1}的内容。`,
        mediaType: mediaType as any,
        mediaUrls: mediaUrls as any,
        status: 'active',
        likeCount: 0,
        commentCount: 0,
        viewCount: Math.floor(Math.random() * 1000),
      },
    })
    islandPosts.push(post)
    
    // 更新岛屿帖子数
    await prisma.island.update({
      where: { id: island.id },
      data: { postCount: { increment: 1 } },
    })
    
    // 更新用户发帖数
    await prisma.user.update({
      where: { id: author.id },
      data: { postCount: { increment: 1 } },
    })
  }
  console.log('创建岛屿帖子: 100条')

  // 生成评论数据（200条）
  const allPosts = [...posts, ...islandPosts]
  for (let i = 0; i < 200; i++) {
    const post = allPosts[Math.floor(Math.random() * allPosts.length)]
    const author = users[Math.floor(Math.random() * users.length)]
    
    await prisma.comment.create({
      data: {
        postId: post.id,
        userId: author.id,
        content: `这是评论${i + 1}的内容。`,
        status: 'active',
      },
    })
    
    // 更新帖子评论数
    await prisma.post.update({
      where: { id: post.id },
      data: { commentCount: { increment: 1 } },
    })
  }
  console.log('创建评论: 200条')

  // 生成点赞数据（500条）
  for (let i = 0; i < 500; i++) {
    const post = allPosts[Math.floor(Math.random() * allPosts.length)]
    const user = users[Math.floor(Math.random() * users.length)]
    
    try {
      await prisma.postLike.create({
        data: {
          postId: post.id,
          userId: user.id,
        },
      })
      
      // 更新帖子点赞数
      await prisma.post.update({
        where: { id: post.id },
        data: { likeCount: { increment: 1 } },
      })
      
      // 更新用户获赞数
      const postAuthor = await prisma.post.findUnique({
        where: { id: post.id },
        select: { userId: true },
      })
      if (postAuthor) {
        await prisma.user.update({
          where: { id: postAuthor.userId },
          data: { likeCount: { increment: 1 } },
        })
      }
    } catch (e) {
      // 忽略重复点赞
    }
  }
  console.log('创建点赞: 500条')

  // 生成岛屿成员关系（部分用户加入岛屿）
  for (let i = 0; i < 30; i++) {
    const island = islands[Math.floor(Math.random() * islands.length)]
    const user = users[Math.floor(Math.random() * users.length)]
    
    if (island.ownerId !== user.id) {
      try {
        await prisma.islandMember.create({
          data: {
            islandId: island.id,
            userId: user.id,
            joinType: island.price > 0 ? 'paid' : 'free',
            paidAmount: island.price,
          },
        })
        
        // 更新岛屿成员数
        await prisma.island.update({
          where: { id: island.id },
          data: { memberCount: { increment: 1 } },
        })
      } catch (e) {
        // 忽略重复加入
      }
    }
  }
  console.log('创建岛屿成员关系: 30条')

  console.log('测试数据生成完成！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

