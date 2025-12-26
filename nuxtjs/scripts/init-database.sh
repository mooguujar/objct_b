#!/bin/bash

# MySQL 数据库初始化脚本
# 用途：在新服务器上初始化 MySQL，设置密码，配置远程连接

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
MYSQL_ROOT_PASSWORD="123456"
DB_NAME="objct_b"
DB_USER="root"
DB_HOST="0.0.0.0"

echo -e "${GREEN}开始初始化 MySQL 数据库...${NC}"

# 检查 MySQL 是否已安装
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}MySQL 未安装，开始安装...${NC}"
    
    # 检测系统类型
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        sudo apt update
        sudo apt install mysql-server -y
        MYSQL_SERVICE="mysql"
    elif [ -f /etc/redhat-release ]; then
        # CentOS/RHEL
        sudo yum install mysql-server -y
        MYSQL_SERVICE="mysqld"
    else
        echo -e "${RED}不支持的系统类型，请手动安装 MySQL${NC}"
        exit 1
    fi
    
    # 启动 MySQL
    sudo systemctl start $MYSQL_SERVICE
    sudo systemctl enable $MYSQL_SERVICE
    echo -e "${GREEN}MySQL 安装完成${NC}"
else
    echo -e "${GREEN}MySQL 已安装${NC}"
    # 检测服务名称
    if systemctl is-active --quiet mysql; then
        MYSQL_SERVICE="mysql"
    elif systemctl is-active --quiet mysqld; then
        MYSQL_SERVICE="mysqld"
    fi
fi

# 设置 root 密码
echo -e "${YELLOW}设置 root 密码...${NC}"
sudo mysql <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASSWORD}';
FLUSH PRIVILEGES;
EOF

# 配置远程连接
echo -e "${YELLOW}配置远程连接...${NC}"

# 查找 MySQL 配置文件
MYSQL_CONF=""
if [ -f /etc/mysql/mysql.conf.d/mysqld.cnf ]; then
    MYSQL_CONF="/etc/mysql/mysql.conf.d/mysqld.cnf"
elif [ -f /etc/my.cnf ]; then
    MYSQL_CONF="/etc/my.cnf"
elif [ -f /etc/mysql/my.cnf ]; then
    MYSQL_CONF="/etc/mysql/my.cnf"
fi

if [ -n "$MYSQL_CONF" ]; then
    # 备份配置文件
    sudo cp $MYSQL_CONF ${MYSQL_CONF}.bak
    
    # 检查是否已配置 bind-address
    if grep -q "^bind-address" $MYSQL_CONF; then
        # 修改现有配置
        sudo sed -i "s/^bind-address.*/bind-address = ${DB_HOST}/" $MYSQL_CONF
    else
        # 添加新配置
        echo "bind-address = ${DB_HOST}" | sudo tee -a $MYSQL_CONF
    fi
    echo -e "${GREEN}MySQL 配置文件已更新${NC}"
else
    echo -e "${YELLOW}未找到 MySQL 配置文件，请手动配置 bind-address = 0.0.0.0${NC}"
fi

# 创建远程用户并授权
echo -e "${YELLOW}创建远程访问用户...${NC}"
mysql -u root -p${MYSQL_ROOT_PASSWORD} <<EOF
-- 创建远程用户
CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';

-- 授予所有权限
GRANT ALL PRIVILEGES ON *.* TO '${DB_USER}'@'%' WITH GRANT OPTION;

-- 刷新权限
FLUSH PRIVILEGES;

-- 创建数据库
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 显示数据库
SHOW DATABASES;
EOF

# 重启 MySQL
echo -e "${YELLOW}重启 MySQL 服务...${NC}"
sudo systemctl restart $MYSQL_SERVICE

# 配置防火墙
echo -e "${YELLOW}配置防火墙...${NC}"
if command -v ufw &> /dev/null; then
    # UFW (Ubuntu/Debian)
    sudo ufw allow 3306/tcp
    sudo ufw reload
    echo -e "${GREEN}UFW 防火墙已配置${NC}"
elif command -v firewall-cmd &> /dev/null; then
    # firewalld (CentOS/RHEL)
    sudo firewall-cmd --permanent --add-service=mysql
    sudo firewall-cmd --reload
    echo -e "${GREEN}firewalld 防火墙已配置${NC}"
else
    echo -e "${YELLOW}未检测到防火墙工具，请手动开放 3306 端口${NC}"
fi

# 测试连接
echo -e "${YELLOW}测试数据库连接...${NC}"
if mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "SELECT 1;" &> /dev/null; then
    echo -e "${GREEN}数据库连接测试成功！${NC}"
else
    echo -e "${RED}数据库连接测试失败${NC}"
    exit 1
fi

# 显示配置信息
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}数据库初始化完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "数据库名称: ${DB_NAME}"
echo -e "用户名: ${DB_USER}"
echo -e "密码: ${MYSQL_ROOT_PASSWORD}"
echo -e "连接地址: $(hostname -I | awk '{print $1}'):3306"
echo -e "\n${YELLOW}连接字符串示例:${NC}"
echo -e "mysql://${DB_USER}:${MYSQL_ROOT_PASSWORD}@$(hostname -I | awk '{print $1}'):3306/${DB_NAME}?charset=utf8mb4"
echo -e "\n${YELLOW}下一步操作:${NC}"
echo -e "1. 在云服务器控制台配置安全组，开放 3306 端口"
echo -e "2. 在项目 .env 文件中配置 DATABASE_URL"
echo -e "3. 运行: npm run db:generate && npm run db:migrate"

