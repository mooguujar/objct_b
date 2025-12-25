@echo off
chcp 65001 >nul
echo 正在启动 ngrok，映射 3000 端口...
echo.
echo 如果这是第一次使用 ngrok，需要先配置认证 token：
echo 1. 访问 https://dashboard.ngrok.com/get-started/your-authtoken
echo 2. 复制你的 authtoken
echo 3. 运行命令: ngrok config add-authtoken YOUR_TOKEN
echo.
pause
echo.
echo 启动 ngrok...
ngrok http 3000
pause

