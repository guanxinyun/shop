@echo off
title Atelier Shop Android Sync
echo [1/2] Syncing web assets to Android...
call npx cap add android 2>nul
call npx cap sync

echo.
echo [2/2] Opening Android Studio to export APK...
call npx cap open android
pause
