# 数据库连接命令

## 使用 MySQL 客户端连接

### Windows 命令行

```bash
mysql -h 0.tcp.in.ngrok.io -P 12153 -u root -p123456 island_social
```

或者分步输入密码（更安全）：

```bash
mysql -h 0.tcp.in.ngrok.io -P 12153 -u root -p island_social
# 然后输入密码: 123456
```

### 参数说明
- `-h`: 主机地址 (0.tcp.in.ngrok.io)
- `-P`: 端口 (12153)
- `-u`: 用户名 (root)
- `-p`: 密码（注意：-p 和密码之间不能有空格）
- `island_social`: 数据库名称

### 常用 SQL 命令

连接成功后，可以使用以下命令：

```sql
-- 查看所有数据库
SHOW DATABASES;

-- 使用当前数据库
USE island_social;

-- 查看所有表
SHOW TABLES;

-- 查看表结构
DESCRIBE table_name;

-- 查看表数据
SELECT * FROM table_name LIMIT 10;

-- 退出
EXIT;
```

## 如果 MySQL 客户端未安装

### 方法 1: 使用 Node.js 脚本

```bash
node scripts/test-db-connection.js
```

### 方法 2: 使用 Prisma Studio（图形界面）

```bash
npm run prisma:studio
```

### 方法 3: 安装 MySQL 客户端

#### Windows (使用 Chocolatey)
```powershell
choco install mysql
```

#### Windows (使用 MySQL Installer)
下载并安装 MySQL Community Server:
https://dev.mysql.com/downloads/installer/

#### 或者只安装 MySQL Client
下载 MySQL Shell 或 MySQL Command Line Client

