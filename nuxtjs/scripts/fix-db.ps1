# 数据库修复脚本 (PowerShell)
# 用于修复 Prisma 数据库迁移和客户端生成问题

Write-Host "开始修复数据库问题..." -ForegroundColor Green

# 1. 检查环境变量
if (-not $env:DATABASE_URL) {
    Write-Host "错误: DATABASE_URL 环境变量未设置" -ForegroundColor Red
    Write-Host "请设置 DATABASE_URL，格式: mysql://user:password@host:port/database" -ForegroundColor Yellow
    exit 1
}

# 2. 重新生成 Prisma Client
Write-Host "正在重新生成 Prisma Client..." -ForegroundColor Yellow
npx prisma generate

# 3. 执行数据库迁移
Write-Host "正在执行数据库迁移..." -ForegroundColor Yellow
npx prisma migrate deploy

# 4. 验证数据库连接
Write-Host "正在验证数据库连接..." -ForegroundColor Yellow
npx prisma db pull --force

Write-Host "修复完成！" -ForegroundColor Green

