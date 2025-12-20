// 查看种子数据脚本
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 从 .env 文件读取配置
function getDatabaseConfig() {
  const envPath = path.join(__dirname, '..', '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
  
  if (!dbUrlMatch) {
    throw new Error('无法从 .env 文件读取 DATABASE_URL');
  }
  
  const dbUrl = dbUrlMatch[1].trim();
  const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  
  if (!match) {
    throw new Error('无法解析 DATABASE_URL 格式');
  }
  
  return {
    host: match[3],
    port: parseInt(match[4]),
    user: match[1],
    password: match[2],
    database: match[5],
  };
}

async function showSeedData() {
  let config;
  try {
    config = getDatabaseConfig();
  } catch (error) {
    console.error('❌ 配置读取失败:', error.message);
    process.exit(1);
  }

  try {
    const connection = await mysql.createConnection(config);
    console.log(`✅ 已连接到数据库: ${config.database}\n`);

    // 查看用户
    const [users] = await connection.execute('SELECT id, username, nickname, email, role, status, coin_balance FROM user LIMIT 10');
    console.log(`👤 用户 (共 ${users.length} 个):`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.nickname} (@${user.username}) - ${user.role} - 金币: ${user.coin_balance}`);
    });

    // 查看岛屿
    const [islands] = await connection.execute('SELECT id, name, category, status FROM island LIMIT 10');
    console.log(`\n🏝️  岛屿 (共 ${islands.length} 个):`);
    islands.forEach((island, index) => {
      console.log(`   ${index + 1}. ${island.name} (${island.category}) - ${island.status}`);
    });

    // 查看帖子
    const [posts] = await connection.execute('SELECT id, title, like_count, comment_count FROM post LIMIT 10');
    console.log(`\n📄 帖子 (共 ${posts.length} 个):`);
    posts.forEach((post, index) => {
      console.log(`   ${index + 1}. ${post.title || '(无标题)'} - 👍${post.like_count} 💬${post.comment_count}`);
    });

    // 查看关注关系
    const [follows] = await connection.execute(`
      SELECT f.id, u1.nickname as follower, u2.nickname as following 
      FROM follow f
      JOIN user u1 ON f.follower_id = u1.id
      JOIN user u2 ON f.following_id = u2.id
      LIMIT 10
    `);
    console.log(`\n👥 关注关系 (共 ${follows.length} 个):`);
    follows.forEach((follow, index) => {
      console.log(`   ${index + 1}. ${follow.follower} 关注 ${follow.following}`);
    });

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ 操作失败:');
    console.error(`   错误代码: ${error.code}`);
    console.error(`   错误信息: ${error.message}`);
    process.exit(1);
  }
}

showSeedData();

