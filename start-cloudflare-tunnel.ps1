# Cloudflare Tunnel 启动脚本
# 使用方法：在 PowerShell 中运行 .\start-cloudflare-tunnel.ps1

Write-Host "正在检查 Cloudflare Tunnel (cloudflared)..." -ForegroundColor Green

# 检查是否已安装
$cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cloudflared) {
    Write-Host "cloudflared 未安装！" -ForegroundColor Red
    Write-Host "`n请先运行: .\安装-cloudflared.ps1" -ForegroundColor Yellow
    Write-Host "或者手动安装：" -ForegroundColor Yellow
    Write-Host "1. 访问 https://github.com/cloudflare/cloudflared/releases/latest" -ForegroundColor Cyan
    Write-Host "2. 下载 cloudflared-windows-amd64.exe" -ForegroundColor Cyan
    Write-Host "3. 重命名为 cloudflared.exe 并放到 PATH 目录" -ForegroundColor Cyan
    Write-Host "`n或者使用包管理器：" -ForegroundColor Cyan
    Write-Host "  Chocolatey: choco install cloudflared" -ForegroundColor Cyan
    Write-Host "  Scoop: scoop install cloudflared" -ForegroundColor Cyan
    pause
    exit
}

Write-Host "cloudflared 已安装 ✓" -ForegroundColor Green
Write-Host "`n正在启动隧道，映射 3000 端口..." -ForegroundColor Green
Write-Host "提示：首次使用会自动打开浏览器登录 Cloudflare 账号（免费注册）" -ForegroundColor Yellow
Write-Host "`n按 Ctrl+C 停止隧道`n" -ForegroundColor Gray
Write-Host "=" * 50 -ForegroundColor Gray

# 启动隧道（不需要登录，直接使用）
cloudflared tunnel --url http://localhost:3000

