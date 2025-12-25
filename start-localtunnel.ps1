# localtunnel 启动脚本
# 使用方法：在 PowerShell 中运行 .\start-localtunnel.ps1

Write-Host "正在检查 localtunnel..." -ForegroundColor Green

# 检查是否已安装
$lt = Get-Command lt -ErrorAction SilentlyContinue
if (-not $lt) {
    Write-Host "localtunnel 未安装，正在全局安装..." -ForegroundColor Yellow
    npm install -g localtunnel
}

Write-Host "localtunnel 已安装 ✓" -ForegroundColor Green
Write-Host "`n正在启动隧道，映射 3000 端口..." -ForegroundColor Green
Write-Host "注意：访问时会要求输入密码，密码会在终端中显示" -ForegroundColor Yellow
Write-Host "提示：可以指定子域名，例如: lt --port 3000 --subdomain myapp" -ForegroundColor Cyan
Write-Host "`n按 Ctrl+C 停止隧道`n" -ForegroundColor Gray
Write-Host "=" * 50 -ForegroundColor Gray

# 启动隧道（显示请求信息，可以看到密码）
lt --port 3000 --print-requests

