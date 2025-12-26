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

# 检测系统类型
if [ -f /etc/redhat-release ]; then
    # CentOS/RHEL
    SYSTEM_TYPE="redhat"
    MYSQL_SERVICE="mysqld"
elif [ -f /etc/debian_version ]; then
    # Debian/Ubuntu
    SYSTEM_TYPE="debian"
    MYSQL_SERVICE="mysql"
else
    SYSTEM_TYPE="unknown"
fi

# 检查 MySQL 服务是否存在
MYSQL_INSTALLED=false
if systemctl list-unit-files | grep -qiE "mysqld.service"; then
    MYSQL_INSTALLED=true
    MYSQL_SERVICE="mysqld"
elif systemctl list-unit-files | grep -qiE "mysql.service"; then
    MYSQL_INSTALLED=true
    MYSQL_SERVICE="mysql"
fi

# 如果服务不存在，检查服务文件
if [ "$MYSQL_INSTALLED" = false ]; then
    if [ -f /usr/lib/systemd/system/mysqld.service ] || [ -f /etc/systemd/system/mysqld.service ]; then
        MYSQL_INSTALLED=true
        MYSQL_SERVICE="mysqld"
    elif [ -f /usr/lib/systemd/system/mysql.service ] || [ -f /etc/systemd/system/mysql.service ]; then
        MYSQL_INSTALLED=true
        MYSQL_SERVICE="mysql"
    fi
fi

# 如果服务存在但未运行，尝试启动
if [ "$MYSQL_INSTALLED" = true ]; then
    echo -e "${GREEN}检测到 MySQL 服务已安装 (${MYSQL_SERVICE})${NC}"
    
    # 检查服务状态
    if ! systemctl is-active --quiet $MYSQL_SERVICE; then
        echo -e "${YELLOW}启动 MySQL 服务...${NC}"
        sudo systemctl start $MYSQL_SERVICE
        sleep 2
    fi
    
    # 确保服务开机自启
    if ! systemctl is-enabled --quiet $MYSQL_SERVICE; then
        sudo systemctl enable $MYSQL_SERVICE
    fi
else
    echo -e "${YELLOW}MySQL 服务未安装，开始安装...${NC}"
    
    # if [ "$SYSTEM_TYPE" = "debian" ]; then
    #     # Debian/Ubuntu
    #     sudo apt update
    #     sudo apt install mysql-server -y
    #     MYSQL_SERVICE="mysql"
    # elif [ "$SYSTEM_TYPE" = "redhat" ]; then
    #     # CentOS/RHEL
    #     sudo yum install mysql-server -y
    #     MYSQL_SERVICE="mysqld"
    # else
    #     echo -e "${RED}不支持的系统类型，请手动安装 MySQL${NC}"
    #     exit 1
    # fi
    
    # 启动 MySQL
    sudo systemctl start $MYSQL_SERVICE
    sudo systemctl enable $MYSQL_SERVICE
    echo -e "${GREEN}MySQL 安装完成${NC}"
fi

# 检查 MySQL 客户端命令
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}MySQL 客户端未安装，尝试安装...${NC}"
    if [ "$SYSTEM_TYPE" = "debian" ]; then
        sudo apt install mysql-client -y
    elif [ "$SYSTEM_TYPE" = "redhat" ]; then
        sudo yum install mysql -y
    fi
fi

# 等待 MySQL 完全启动
echo -e "${YELLOW}等待 MySQL 服务启动...${NC}"
sleep 3

# 设置 root 密码
echo -e "${YELLOW}设置 root 密码...${NC}"

# 尝试使用 sudo mysql 连接（无需密码）
if sudo mysql -e "SELECT 1;" &> /dev/null; then
    # 可以直接连接，设置密码
    sudo mysql <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASSWORD}';
FLUSH PRIVILEGES;
EOF
    echo -e "${GREEN}root 密码设置成功${NC}"
elif mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "SELECT 1;" &> /dev/null; then
    # 密码已设置
    echo -e "${GREEN}root 密码已设置${NC}"
else
    # 需要密码或无法连接，尝试其他方法
    echo -e "${YELLOW}尝试使用默认方式设置密码...${NC}"
    # 对于 CentOS，可能需要先获取临时密码
    if [ "$SYSTEM_TYPE" = "redhat" ]; then
        # 检查是否有临时密码文件
        TEMP_PASSWORD=$(sudo grep 'temporary password' /var/log/mysqld.log 2>/dev/null | tail -1 | awk '{print $NF}' || echo "")
        if [ -n "$TEMP_PASSWORD" ]; then
            echo -e "${YELLOW}检测到临时密码，正在设置新密码...${NC}"
            mysql -u root -p"${TEMP_PASSWORD}" --connect-expired-password <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';
FLUSH PRIVILEGES;
EOF
        else
            # 尝试直接设置
            sudo mysql <<EOF 2>/dev/null || true
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASSWORD}';
FLUSH PRIVILEGES;
EOF
        fi
    else
        # 其他系统尝试直接设置
        sudo mysql <<EOF 2>/dev/null || true
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASSWORD}';
FLUSH PRIVILEGES;
EOF
    fi
fi

# 配置远程连接
echo -e "${YELLOW}配置远程连接...${NC}"

# 查找 MySQL 配置文件
MYSQL_CONF=""
if [ "$SYSTEM_TYPE" = "redhat" ]; then
    # CentOS/RHEL 配置文件位置
    if [ -f /etc/my.cnf ]; then
        MYSQL_CONF="/etc/my.cnf"
    elif [ -f /etc/my.cnf.d/mysqld.cnf ]; then
        MYSQL_CONF="/etc/my.cnf.d/mysqld.cnf"
    elif [ -f /etc/mysql/my.cnf ]; then
        MYSQL_CONF="/etc/mysql/my.cnf"
    fi
elif [ "$SYSTEM_TYPE" = "debian" ]; then
    # Debian/Ubuntu 配置文件位置
    if [ -f /etc/mysql/mysql.conf.d/mysqld.cnf ]; then
        MYSQL_CONF="/etc/mysql/mysql.conf.d/mysqld.cnf"
    elif [ -f /etc/mysql/my.cnf ]; then
        MYSQL_CONF="/etc/mysql/my.cnf"
    elif [ -f /etc/my.cnf ]; then
        MYSQL_CONF="/etc/my.cnf"
    fi
else
    # 通用查找
    if [ -f /etc/my.cnf ]; then
        MYSQL_CONF="/etc/my.cnf"
    elif [ -f /etc/mysql/my.cnf ]; then
        MYSQL_CONF="/etc/mysql/my.cnf"
    elif [ -f /etc/mysql/mysql.conf.d/mysqld.cnf ]; then
        MYSQL_CONF="/etc/mysql/mysql.conf.d/mysqld.cnf"
    fi
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

# 确保 MySQL 服务正在运行
if ! systemctl is-active --quiet $MYSQL_SERVICE; then
    echo -e "${YELLOW}MySQL 服务未运行，正在启动...${NC}"
    sudo systemctl start $MYSQL_SERVICE
    sleep 3
fi

# 创建远程用户并授权
echo -e "${YELLOW}创建远程访问用户...${NC}"

# 尝试连接数据库
MYSQL_CMD="mysql -u root"
if ! $MYSQL_CMD -e "SELECT 1;" &> /dev/null; then
    # 需要密码
    MYSQL_CMD="mysql -u root -p${MYSQL_ROOT_PASSWORD}"
fi

$MYSQL_CMD <<EOF
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
TEST_CMD="mysql -u root"
if ! $TEST_CMD -e "SELECT 1;" &> /dev/null; then
    TEST_CMD="mysql -u root -p${MYSQL_ROOT_PASSWORD}"
fi

if $TEST_CMD -e "SELECT 1;" &> /dev/null; then
    echo -e "${GREEN}数据库连接测试成功！${NC}"
else
    echo -e "${RED}数据库连接测试失败，请检查密码是否正确${NC}"
    echo -e "${YELLOW}提示：如果密码设置失败，请手动执行以下命令：${NC}"
    echo -e "  sudo mysql"
    echo -e "  ALTER USER 'root'@'localhost' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';"
    echo -e "  FLUSH PRIVILEGES;"
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

