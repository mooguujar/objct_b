// 创建数据库脚本
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
  // 解析 mysql://user:password@host:port/database
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

async function createDatabase() {
  let config;
  try {
    config = getDatabaseConfig();
  } catch (error) {
    console.error('❌ 配置读取失败:', error.message);
    process.exit(1);
  }

  console.log('正在连接数据库服务器...');
  console.log(`主机: ${config.host}:${config.port}`);
  
  try {
    // 连接到 MySQL 服务器（不指定数据库）
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
    });
    console.log('✅ 数据库连接成功！\n');

    // 检查数据库是否已存在
    const [databases] = await connection.execute('SHOW DATABASES');
    const islandSocialExists = databases.some(db => db.Database === config.database);
    
    if (islandSocialExists) {
      console.log(`ℹ️  ${config.database} 数据库已存在`);
      await connection.end();
      process.exit(0);
    }

    // 创建数据库
    console.log(`正在创建 ${config.database} 数据库...`);
    await connection.execute(
      `CREATE DATABASE ${config.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log('✅ 数据库创建成功！\n');

    // 验证数据库
    const [newDatabases] = await connection.execute('SHOW DATABASES');
    const verified = newDatabases.some(db => db.Database === config.database);
    
    if (verified) {
      console.log(`✅ 数据库验证成功：${config.database} 已存在`);
    } else {
      console.log(`❌ 数据库验证失败：${config.database} 未找到`);
    }

    await connection.end();
    console.log('\n💡 下一步：运行数据库迁移');
    console.log('   npm run prisma:migrate');
    process.exit(0);
  } catch (error) {
    console.error('❌ 操作失败:');
    console.error(`   错误代码: ${error.code}`);
    console.error(`   错误信息: ${error.message}`);
    
    if (error.code === 'ER_DB_CREATE_EXISTS') {
      console.log('\n💡 数据库已存在，无需创建');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 可能的原因:');
      console.error('   1. MySQL 服务器未运行');
      console.error('   2. ngrok 隧道未启动');
      console.error('   3. 端口配置不正确');
    }
    
    process.exit(1);
  }
}

// 执行创建数据库
createDatabase();
