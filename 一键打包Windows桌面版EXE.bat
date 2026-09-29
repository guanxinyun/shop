@echo off
chcp 65001 >nul
echo ========================================================
echo   《工坊物语》Windows 独立桌面版 (.exe) 一键快速打包脚本
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js 环境，请先访问 https://nodejs.org/ 安装 Node.js！
    pause
    exit /b
)

echo [1/3] 正在检查并安装 Electron 打包组件依赖...
call npm install

echo.
echo [2/3] 正在编译构建 Windows 64位独立运行程序与绿色免安装版...
call npm run build:win

echo.
if exist "release\工坊物语 1.0.0.exe" (
    echo ========================================================
    echo [成功] EXE 桌面版已生成！文件位于 release 文件夹中：
    echo   1. release\工坊物语 1.0.0.exe (绿色便携版，双击直接畅玩)
    echo   2. release\工坊物语 Setup 1.0.0.exe (安装引导版)
    echo ========================================================
) else (
    echo [提示] 编译完成，请进入 release 目录查看输出文件。
)
echo.
pause
