# ngrok 启动脚本
# 使用方法：在 PowerShell 中运行 .\start-ngrok.ps1

Write-Host "正在启动 ngrok，映射 3000 端口..." -ForegroundColor Green

# 检查 3000 端口是否被占用
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if (-not $port3000) {
    Write-Host "警告: 3000 端口似乎没有被占用，请确保 Nuxt.js 开发服务器正在运行！" -ForegroundColor Yellow
}

# 启动 ngrok
Write-Host "`n如果这是第一次使用 ngrok，需要先配置认证 token：" -ForegroundColor Cyan
Write-Host "1. 访问 https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor Cyan
Write-Host "2. 复制你的 authtoken" -ForegroundColor Cyan
Write-Host "3. 运行命令: ngrok config add-authtoken YOUR_TOKEN" -ForegroundColor Cyan
Write-Host "`n按任意键继续启动 ngrok（如果已配置 token）..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "`n启动 ngrok..." -ForegroundColor Green
ngrok http 3000

