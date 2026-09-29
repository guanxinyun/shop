@echo off
chcp 65001 >nul
echo ========================================================
echo   《工坊物语》Android 安卓移动端 (.apk) 一键同步与构建脚本
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js 环境，请先安装 Node.js！
    pause
    exit /b
)

echo [1/3] 正在同步网页资源到 Android 原生工程...
call npx cap add android 2>nul
call npx cap sync

echo.
echo [2/3] 正在调起 Android Studio 或准备编译...
echo.
echo 提示：
echo 1. 脚本将自动打开 Android Studio；
echo 2. 在 Android Studio 顶部菜单点击: Build -^> Build Bundle(s)/APK(s) -^> Build APK(s)；
echo 3. 编译完成后点击右下角 locate 即可直接获得 app-debug.apk 安装包！
echo.
call npx cap open android
pause
