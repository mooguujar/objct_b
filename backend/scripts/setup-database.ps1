# 数据库初始化脚本

Write-Host "开始初始化数据库..." -ForegroundColor Green

# 检查 .env 文件
if (-not (Test-Path ".env")) {
    Write-Host "错误: .env 文件不存在" -ForegroundColor Red
    exit 1
}

# 读取 DATABASE_URL
$envContent = Get-Content .env -Raw
if ($envContent -match 'DATABASE_URL=(.+)') {
    $databaseUrl = $matches[1].Trim()
    Write-Host "数据库连接: $databaseUrl" -ForegroundColor Yellow
} else {
    Write-Host "错误: 在 .env 文件中找不到 DATABASE_URL" -ForegroundColor Red
    exit 1
}

# 检查数据库连接
Write-Host "`n检查数据库连接..." -ForegroundColor Yellow
$env:DATABASE_URL = $databaseUrl

# 生成 Prisma Client
Write-Host "`n1. 生成 Prisma Client..." -ForegroundColor Cyan
npm run prisma:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: Prisma Client 生成失败" -ForegroundColor Red
    exit 1
}

# 运行迁移
Write-Host "`n2. 运行数据库迁移..." -ForegroundColor Cyan
npm run prisma:migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 数据库迁移失败" -ForegroundColor Red
    Write-Host "请确保:" -ForegroundColor Yellow
    Write-Host "  - 数据库服务器正在运行" -ForegroundColor Yellow
    Write-Host "  - ngrok 隧道已启动（如果使用）" -ForegroundColor Yellow
    Write-Host "  - 数据库连接配置正确" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n数据库初始化完成！" -ForegroundColor Green
Write-Host "可以运行 'npm run prisma:studio' 查看数据库" -ForegroundColor Cyan

