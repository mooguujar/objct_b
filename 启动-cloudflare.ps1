# 快速启动 Cloudflare Tunnel
$cloudflaredPath = "$env:USERPROFILE\cloudflared.exe"

if (-not (Test-Path $cloudflaredPath)) {
    Write-Host "cloudflared 未找到！" -ForegroundColor Red
    Write-Host "请先运行安装脚本或手动下载 cloudflared" -ForegroundColor Yellow
    pause
    exit
}

Write-Host "正在启动 Cloudflare Tunnel..." -ForegroundColor Green
Write-Host "映射端口: 3000" -ForegroundColor Cyan
Write-Host "`n提示：首次使用会自动打开浏览器登录 Cloudflare 账号（免费）" -ForegroundColor Yellow
Write-Host "按 Ctrl+C 停止隧道`n" -ForegroundColor Gray
Write-Host "=" * 50 -ForegroundColor Gray

# 启动隧道
& $cloudflaredPath tunnel --url http://localhost:3000

