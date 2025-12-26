# Vercel 快速部署脚本
Write-Host "=== Vercel 部署脚本 ===" -ForegroundColor Green
Write-Host ""

# 检查是否已登录
Write-Host "检查 Vercel 登录状态..." -ForegroundColor Cyan
$loginCheck = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "未登录，正在打开登录页面..." -ForegroundColor Yellow
    vercel login
} else {
    Write-Host "已登录: $loginCheck" -ForegroundColor Green
}

Write-Host ""
Write-Host "进入项目目录..." -ForegroundColor Cyan
Set-Location "nuxtjs"

Write-Host ""
Write-Host "开始部署..." -ForegroundColor Green
Write-Host "提示：首次部署会询问项目配置" -ForegroundColor Yellow
Write-Host ""

# 部署
vercel

Write-Host ""
Write-Host "部署完成！" -ForegroundColor Green
Write-Host ""
Write-Host "下一步：" -ForegroundColor Cyan
Write-Host "1. 配置环境变量（如果还未配置）" -ForegroundColor Yellow
Write-Host "2. 运行 'vercel --prod' 部署到生产环境" -ForegroundColor Yellow
Write-Host ""
Write-Host "查看详细指南: vercel部署指南.md" -ForegroundColor Gray

