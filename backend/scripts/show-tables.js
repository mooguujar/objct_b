// 查看数据库表脚本
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

async function showTables() {
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

    const [tables] = await connection.execute('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('ℹ️  数据库中没有表');
    } else {
      console.log(`📊 数据库表 (共 ${tables.length} 个):`);
      tables.forEach((table, index) => {
        const tableName = table[`Tables_in_${config.database}`];
        console.log(`   ${index + 1}. ${tableName}`);
      });
    }

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ 操作失败:');
    console.error(`   错误代码: ${error.code}`);
    console.error(`   错误信息: ${error.message}`);
    process.exit(1);
  }
}

showTables();

