#!/bin/bash

# PM2 问题诊断脚本
# 使用方法: ./诊断PM2问题.sh

APP_NAME="nuxtjs-app"

echo "========================================="
echo "PM2 问题诊断"
echo "========================================="

# 1. 检查应用状态
echo ""
echo "1. 应用状态："
pm2 describe $APP_NAME 2>/dev/null || echo "应用不存在或未运行"

# 2. 查看最近的日志
echo ""
echo "2. 最近的错误日志（最后 30 行）："
echo "----------------------------------------"
pm2 logs $APP_NAME --err --lines 30 --nostream 2>/dev/null || echo "无错误日志"

# 3. 查看标准输出日志
echo ""
echo "3. 最近的标准输出日志（最后 30 行）："
echo "----------------------------------------"
pm2 logs $APP_NAME --out --lines 30 --nostream 2>/dev/null || echo "无输出日志"

# 4. 检查必要文件
echo ""
echo "4. 检查必要文件："
cd "$(dirname "$0")"
echo "  当前目录: $(pwd)"
echo "  .output/server/index.mjs: $([ -f .output/server/index.mjs ] && echo '✓ 存在' || echo '✗ 不存在')"
echo "  ecosystem.config.cjs: $([ -f ecosystem.config.cjs ] && echo '✓ 存在' || echo '✗ 不存在')"
echo "  .env: $([ -f .env ] && echo '✓ 存在' || echo '✗ 不存在（可选）')"

# 5. 检查 Node.js 版本
echo ""
echo "5. Node.js 版本："
node -v
which node

# 6. 测试手动启动
echo ""
echo "6. 测试手动启动（按 Ctrl+C 停止）："
echo "----------------------------------------"
echo "运行命令: node --experimental-fetch .output/server/index.mjs"
echo ""
read -p "是否测试手动启动？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    node --experimental-fetch .output/server/index.mjs
fi

echo ""
echo "========================================="
echo "诊断完成"
echo "========================================="

