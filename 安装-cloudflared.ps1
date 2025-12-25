# 安装 Cloudflare Tunnel (cloudflared)
Write-Host "正在检查 cloudflared 是否已安装..." -ForegroundColor Green

$cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
if ($cloudflared) {
    Write-Host "cloudflared 已安装，版本: $($cloudflared.Version)" -ForegroundColor Green
    exit 0
}

Write-Host "cloudflared 未安装，正在安装..." -ForegroundColor Yellow
Write-Host "`n方法 1: 使用 Chocolatey (推荐)" -ForegroundColor Cyan
Write-Host "如果已安装 Chocolatey，运行: choco install cloudflared" -ForegroundColor Cyan
Write-Host "`n方法 2: 使用 Scoop" -ForegroundColor Cyan
Write-Host "如果已安装 Scoop，运行: scoop install cloudflared" -ForegroundColor Cyan
Write-Host "`n方法 3: 手动下载" -ForegroundColor Cyan
Write-Host "1. 访问: https://github.com/cloudflare/cloudflared/releases/latest" -ForegroundColor Cyan
Write-Host "2. 下载 cloudflared-windows-amd64.exe" -ForegroundColor Cyan
Write-Host "3. 重命名为 cloudflared.exe" -ForegroundColor Cyan
Write-Host "4. 放到 PATH 环境变量中的目录（如 C:\Windows\System32）" -ForegroundColor Cyan

# 尝试使用 Chocolatey 安装
$choco = Get-Command choco -ErrorAction SilentlyContinue
if ($choco) {
    Write-Host "`n检测到 Chocolatey，正在使用 Chocolatey 安装..." -ForegroundColor Green
    choco install cloudflared -y
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n安装成功！" -ForegroundColor Green
        Write-Host "现在可以运行: .\start-cloudflare-tunnel.ps1" -ForegroundColor Cyan
    }
} else {
    Write-Host "`n未检测到 Chocolatey，请手动安装 cloudflared" -ForegroundColor Yellow
}

pause

