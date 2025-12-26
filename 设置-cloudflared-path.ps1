# 设置 cloudflared 到 PATH
$cloudflaredPath = "$env:USERPROFILE\cloudflared.exe"

if (Test-Path $cloudflaredPath) {
    $currentPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)
    $userProfilePath = $env:USERPROFILE
    
    if ($currentPath -notlike "*$userProfilePath*") {
        $newPath = "$currentPath;$userProfilePath"
        [Environment]::SetEnvironmentVariable("Path", $newPath, [EnvironmentVariableTarget]::User)
        Write-Host "已添加 $userProfilePath 到 PATH" -ForegroundColor Green
        Write-Host "请重新打开 PowerShell 窗口使 PATH 生效" -ForegroundColor Yellow
    } else {
        Write-Host "PATH 已包含 $userProfilePath" -ForegroundColor Green
    }
    
    Write-Host "`ncloudflared 位置: $cloudflaredPath" -ForegroundColor Cyan
    Write-Host "可以直接使用完整路径运行: `"$cloudflaredPath`" tunnel --url http://localhost:3000" -ForegroundColor Cyan
} else {
    Write-Host "cloudflared 未找到，请先运行安装脚本" -ForegroundColor Red
}

