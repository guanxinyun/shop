@echo off
title Atelier Shop Builder
echo [1/2] Checking dependencies...
call npm install --registry=https://registry.npmmirror.com

echo.
echo [2/2] Building Windows 64-bit EXE...
call npx electron-builder --win --x64

echo.
echo ========================================================
echo Build complete! Please check the release folder.
echo ========================================================
pause
