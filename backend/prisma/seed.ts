import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始创建测试数据...\n');

  // 清理现有数据（可选，谨慎使用）
  // await prisma.commentLike.deleteMany();
  // await prisma.postCollect.deleteMany();
  // await prisma.postLike.deleteMany();
  // await prisma.comment.deleteMany();
  // await prisma.post.deleteMany();
  // await prisma.islandMember.deleteMany();
  // await prisma.island.deleteMany();
  // await prisma.follow.deleteMany();
  // await prisma.user.deleteMany();

  // 1. 创建测试用户
  console.log('📝 创建测试用户...');
  const passwordHash = await bcrypt.hash('123456', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'admin',
        nickname: '管理员',
        email: 'admin@island.com',
        phone: '13800138000',
        passwordHash,
        bio: '我是平台管理员，负责维护平台秩序。',
        role: 'admin',
        status: 'active',
        isVerified: true,
        coinBalance: 10000,
      },
    }),
    prisma.user.create({
      data: {
        username: 'alice',
        nickname: '爱丽丝',
        email: 'alice@island.com',
        phone: '13800138001',
        passwordHash,
        bio: '热爱分享生活的创作者 ✨',
        role: 'creator',
        status: 'active',
        isVerified: true,
        coinBalance: 5000,
      },
    }),
    prisma.user.create({
      data: {
        username: 'bob',
        nickname: '鲍勃',
        email: 'bob@island.com',
        phone: '13800138002',
        passwordHash,
        bio: '旅行爱好者，喜欢探索不同的岛屿',
        role: 'user',
        status: 'active',
        isVerified: false,
        coinBalance: 2000,
      },
    }),
    prisma.user.create({
      data: {
        username: 'charlie',
        nickname: '查理',
        email: 'charlie@island.com',
        phone: '13800138003',
        passwordHash,
        bio: '摄影爱好者，用镜头记录美好瞬间',
        role: 'user',
        status: 'active',
        isVerified: false,
        coinBalance: 1500,
      },
    }),
    prisma.user.create({
      data: {
        username: 'diana',
        nickname: '戴安娜',
        email: 'diana@island.com',
        phone: '13800138004',
        passwordHash,
        bio: '美食博主，分享各种美食制作方法',
        role: 'creator',
        status: 'active',
        isVerified: true,
        coinBalance: 3000,
      },
    }),
  ]);

  console.log(`✅ 创建了 ${users.length} 个用户\n`);

  // 2. 创建关注关系
  console.log('👥 创建关注关系...');
  await prisma.follow.createMany({
    data: [
      { followerId: users[1].id, followingId: users[0].id }, // alice 关注 admin
      { followerId: users[2].id, followingId: users[1].id }, // bob 关注 alice
      { followerId: users[2].id, followingId: users[4].id }, // bob 关注 diana
      { followerId: users[3].id, followingId: users[1].id }, // charlie 关注 alice
      { followerId: users[4].id, followingId: users[1].id }, // diana 关注 alice
    ],
  });

  // 更新关注数
  await Promise.all([
    prisma.user.update({ where: { id: users[0].id }, data: { followerCount: 1 } }),
    prisma.user.update({ where: { id: users[1].id }, data: { followerCount: 3, followCount: 1 } }),
    prisma.user.update({ where: { id: users[4].id }, data: { followerCount: 1, followCount: 1 } }),
  ]);

  console.log('✅ 创建了关注关系\n');

  // 3. 创建岛屿
  console.log('🏝️  创建岛屿...');
  const islands = await Promise.all([
    prisma.island.create({
      data: {
        name: '美食天堂',
        description: '分享各种美食制作技巧和食谱，一起探索美食的乐趣！',
        category: '美食',
        ownerId: users[4].id, // diana
        price: 0,
        status: 'active',
        isVerified: true,
      },
    }),
    prisma.island.create({
      data: {
        name: '旅行日记',
        description: '记录每一次旅行的美好瞬间，分享旅行攻略和心得',
        category: '旅行',
        ownerId: users[2].id, // bob
        price: 0,
        status: 'active',
        isVerified: false,
      },
    }),
    prisma.island.create({
      data: {
        name: '摄影艺术',
        description: '摄影技巧分享，作品展示，一起提升摄影水平',
        category: '摄影',
        ownerId: users[3].id, // charlie
        price: 0,
        status: 'active',
        isVerified: true,
      },
    }),
  ]);

  // 添加岛屿成员
  await prisma.islandMember.createMany({
    data: [
      { islandId: islands[0].id, userId: users[1].id }, // alice 加入美食天堂
      { islandId: islands[1].id, userId: users[1].id }, // alice 加入旅行日记
      { islandId: islands[2].id, userId: users[2].id }, // bob 加入摄影艺术
    ],
  });

  // 更新岛屿成员数
  await Promise.all([
    prisma.island.update({ where: { id: islands[0].id }, data: { memberCount: 2 } }),
    prisma.island.update({ where: { id: islands[1].id }, data: { memberCount: 2 } }),
    prisma.island.update({ where: { id: islands[2].id }, data: { memberCount: 2 } }),
  ]);

  console.log(`✅ 创建了 ${islands.length} 个岛屿\n`);

  // 4. 创建帖子
  console.log('📄 创建帖子...');
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        userId: users[1].id, // alice
        islandId: islands[0].id,
        title: '今天做了超好吃的提拉米苏！',
        content: '分享一个超级简单的提拉米苏制作方法，新手也能轻松上手！需要的材料：马斯卡彭奶酪、手指饼干、咖啡、可可粉...',
        mediaType: 'image',
        mediaUrls: ['https://example.com/tiramisu1.jpg', 'https://example.com/tiramisu2.jpg'],
        status: 'active',
        likeCount: 25,
        commentCount: 8,
        viewCount: 156,
      },
    }),
    prisma.post.create({
      data: {
        userId: users[2].id, // bob
        islandId: islands[1].id,
        title: '巴厘岛旅行攻略',
        content: '刚从巴厘岛回来，分享一些实用的旅行攻略和注意事项。推荐几个必去的景点：乌布、库塔海滩、圣泉寺...',
        mediaType: 'mixed',
        mediaUrls: ['https://example.com/bali1.jpg', 'https://example.com/bali-video.mp4'],
        status: 'active',
        likeCount: 42,
        commentCount: 15,
        viewCount: 289,
      },
    }),
    prisma.post.create({
      data: {
        userId: users[3].id, // charlie
        islandId: islands[2].id,
        title: '日落时分',
        content: '今天在海边拍到了超美的日落，分享给大家！',
        mediaType: 'image',
        mediaUrls: ['https://example.com/sunset1.jpg'],
        status: 'active',
        likeCount: 38,
        commentCount: 12,
        viewCount: 201,
      },
    }),
    prisma.post.create({
      data: {
        userId: users[4].id, // diana
        islandId: islands[0].id,
        title: '自制手工意面',
        content: '周末在家做了手工意面，虽然费时但真的很好吃！',
        mediaType: 'image',
        mediaUrls: ['https://example.com/pasta1.jpg'],
        status: 'active',
        likeCount: 19,
        commentCount: 5,
        viewCount: 98,
      },
    }),
    prisma.post.create({
      data: {
        userId: users[1].id, // alice
        title: '今天天气真好',
        content: '阳光明媚，适合出去走走～',
        mediaType: 'text',
        status: 'active',
        likeCount: 12,
        commentCount: 3,
        viewCount: 67,
      },
    }),
  ]);

  // 更新用户帖子数
  await Promise.all([
    prisma.user.update({ where: { id: users[1].id }, data: { postCount: 2 } }),
    prisma.user.update({ where: { id: users[2].id }, data: { postCount: 1 } }),
    prisma.user.update({ where: { id: users[3].id }, data: { postCount: 1 } }),
    prisma.user.update({ where: { id: users[4].id }, data: { postCount: 1 } }),
  ]);

  // 更新岛屿帖子数
  await Promise.all([
    prisma.island.update({ where: { id: islands[0].id }, data: { postCount: 2 } }),
    prisma.island.update({ where: { id: islands[1].id }, data: { postCount: 1 } }),
    prisma.island.update({ where: { id: islands[2].id }, data: { postCount: 1 } }),
  ]);

  console.log(`✅ 创建了 ${posts.length} 个帖子\n`);

  // 5. 创建评论
  console.log('💬 创建评论...');
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        userId: users[2].id, // bob
        postId: posts[0].id,
        content: '看起来好诱人！能分享一下详细步骤吗？',
        status: 'active',
      },
    }),
    prisma.comment.create({
      data: {
        userId: users[4].id, // diana
        postId: posts[0].id,
        content: '我也做过，真的很好吃！',
        status: 'active',
      },
    }),
    prisma.comment.create({
      data: {
        userId: users[3].id, // charlie
        postId: posts[1].id,
        content: '照片拍得真美！',
        status: 'active',
      },
    }),
    prisma.comment.create({
      data: {
        userId: users[1].id, // alice
        postId: posts[1].id,
        content: '我也想去巴厘岛！',
        status: 'active',
      },
    }),
  ]);

  // 更新帖子评论数
  await Promise.all([
    prisma.post.update({ where: { id: posts[0].id }, data: { commentCount: 2 } }),
    prisma.post.update({ where: { id: posts[1].id }, data: { commentCount: 2 } }),
  ]);

  console.log(`✅ 创建了 ${comments.length} 个评论\n`);

  // 6. 创建点赞
  console.log('👍 创建点赞...');
  await prisma.postLike.createMany({
    data: [
      { userId: users[2].id, postId: posts[0].id },
      { userId: users[3].id, postId: posts[0].id },
      { userId: users[4].id, postId: posts[0].id },
      { userId: users[1].id, postId: posts[1].id },
      { userId: users[3].id, postId: posts[1].id },
      { userId: users[4].id, postId: posts[1].id },
    ],
  });

  console.log('✅ 创建了点赞\n');

  // 7. 创建收藏
  console.log('⭐ 创建收藏...');
  await prisma.postCollect.createMany({
    data: [
      { userId: users[2].id, postId: posts[0].id },
      { userId: users[3].id, postId: posts[1].id },
    ],
  });

  console.log('✅ 创建了收藏\n');

  console.log('🎉 测试数据创建完成！\n');
  console.log('📊 数据统计:');
  console.log(`   - 用户: ${users.length} 个`);
  console.log(`   - 岛屿: ${islands.length} 个`);
  console.log(`   - 帖子: ${posts.length} 个`);
  console.log(`   - 评论: ${comments.length} 个`);
  console.log('\n💡 测试账号信息:');
  console.log('   所有用户密码都是: 123456');
  console.log('   - admin (管理员)');
  console.log('   - alice (创作者)');
  console.log('   - bob (普通用户)');
  console.log('   - charlie (普通用户)');
  console.log('   - diana (创作者)');
}

main()
  .catch((e) => {
    console.error('❌ 创建测试数据失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

