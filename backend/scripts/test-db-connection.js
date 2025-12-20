// 测试数据库连接脚本
const mysql = require('mysql2/promise');

async function testConnection() {
  const config = {
    host: '0.tcp.jp.ngrok.io', //tcp:// 0.tcp.jp.ngrok.io
    port: 10625,
    user: 'root',
    password: '123456',
  };

  console.log('正在测试数据库连接...');
  console.log(`主机: ${config.host}:${config.port}`);
  
  try {
    // 连接到 MySQL 服务器（不指定数据库）
    const connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功！\n');

    // 列出所有数据库
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('📊 可用的数据库:');
    databases.forEach(db => {
      console.log(`  - ${db.Database}`);
    });

    // 检查 island_social 数据库是否存在
    const islandSocialExists = databases.some(db => db.Database === 'island_social');
    console.log(`\n${islandSocialExists ? '✅' : '❌'} island_social 数据库: ${islandSocialExists ? '存在' : '不存在'}`);

    // 如果数据库不存在，询问是否创建
    if (!islandSocialExists) {
      console.log('\n💡 提示: 可以运行以下 SQL 创建数据库:');
      console.log('CREATE DATABASE island_social CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    }

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库连接失败:');
    console.error(`   错误代码: ${error.code}`);
    console.error(`   错误信息: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 可能的原因:');
      console.error('   1. MySQL 服务器未运行');
      console.error('   2. ngrok 隧道未启动');
      console.error('   3. 端口配置不正确');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n💡 可能的原因:');
      console.error('   1. 网络连接超时');
      console.error('   2. ngrok 隧道已断开');
      console.error('   3. 防火墙阻止连接');
    }
    
    process.exit(1);
  }
}

testConnection();

