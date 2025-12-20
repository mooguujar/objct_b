# 数据库连接诊断脚本

Write-Host "=== 数据库连接诊断 ===" -ForegroundColor Cyan
Write-Host ""

# 1. 检查 .env 文件
Write-Host "1. 检查 .env 文件..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $dbUrl = Get-Content .env | Select-String -Pattern "^DATABASE_URL"
    if ($dbUrl) {
        Write-Host "   ✅ .env 文件存在，DATABASE_URL 已配置" -ForegroundColor Green
        Write-Host "   $dbUrl" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ .env 文件中未找到 DATABASE_URL" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ .env 文件不存在" -ForegroundColor Red
}

Write-Host ""

# 2. 解析数据库连接信息
Write-Host "2. 解析数据库连接信息..." -ForegroundColor Yellow
$dbUrl = Get-Content .env | Select-String -Pattern "^DATABASE_URL" | ForEach-Object { $_.Line -replace 'DATABASE_URL=', '' }
if ($dbUrl -match 'mysql://([^:]+):([^@]+)@([^:]+):(\d+)/([^?]+)') {
    $dbUser = $matches[1]
    $dbPass = $matches[2]
    $dbHost = $matches[3]
    $dbPort = $matches[4]
    $dbName = $matches[5]
    
    Write-Host "   主机: $dbHost" -ForegroundColor Gray
    Write-Host "   端口: $dbPort" -ForegroundColor Gray
    Write-Host "   用户: $dbUser" -ForegroundColor Gray
    Write-Host "   数据库: $dbName" -ForegroundColor Gray
} else {
    Write-Host "   ❌ 无法解析 DATABASE_URL" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 3. 测试网络连接
Write-Host "3. 测试网络连接..." -ForegroundColor Yellow
$pingResult = Test-Connection -ComputerName $dbHost -Count 2 -Quiet
if ($pingResult) {
    Write-Host "   ✅ 可以 ping 通 $dbHost" -ForegroundColor Green
} else {
    Write-Host "   ❌ 无法 ping 通 $dbHost" -ForegroundColor Red
}

# 测试端口连接
Write-Host "   测试端口 $dbPort..." -ForegroundColor Gray
$tcpTest = Test-NetConnection -ComputerName $dbHost -Port $dbPort -InformationLevel Quiet -WarningAction SilentlyContinue
if ($tcpTest) {
    Write-Host "   ✅ 端口 $dbPort 可以连接" -ForegroundColor Green
} else {
    Write-Host "   ❌ 端口 $dbPort 无法连接" -ForegroundColor Red
    Write-Host ""
    Write-Host "   💡 可能的原因:" -ForegroundColor Yellow
    Write-Host "      - MySQL 服务器未运行" -ForegroundColor Gray
    Write-Host "      - ngrok 隧道未启动（如果使用 ngrok）" -ForegroundColor Gray
    Write-Host "      - 防火墙阻止连接" -ForegroundColor Gray
    Write-Host "      - 端口配置不正确" -ForegroundColor Gray
}

Write-Host ""

# 4. 尝试使用 Prisma 连接
Write-Host "4. 尝试使用 Prisma 连接..." -ForegroundColor Yellow
$prismaResult = npm run prisma:migrate -- --name test 2>&1 | Select-Object -First 5
if ($prismaResult -match "Can't reach database") {
    Write-Host "   ❌ Prisma 无法连接到数据库" -ForegroundColor Red
} else {
    Write-Host "   ✅ Prisma 连接成功" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== 诊断完成 ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 建议的解决方案:" -ForegroundColor Yellow
Write-Host "   1. 确保 MySQL 服务器正在运行" -ForegroundColor Gray
Write-Host "   2. 如果使用 ngrok，确保隧道已启动:" -ForegroundColor Gray
Write-Host "      ngrok tcp 3306" -ForegroundColor White
Write-Host "   3. 检查防火墙设置" -ForegroundColor Gray
Write-Host "   4. 验证端口配置是否正确" -ForegroundColor Gray

