@echo off
chcp 65001 >nul
title Membuat installer Crypto Analyzer
cd /d "%~dp0"
echo ============================================
echo   Membuat installer Crypto Analyzer
echo   (cukup dilakukan sekali, butuh internet)
echo ============================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js belum terpasang. Memasangnya otomatis lewat winget...
  winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
  if errorlevel 1 (
    echo.
    echo Gagal memasang Node.js otomatis. Pasang manual dari https://nodejs.org lalu klik dua kali file ini lagi.
    pause
    exit /b 1
  )
  echo.
  echo Node.js sudah terpasang. TUTUP jendela ini lalu klik dua kali Buat-Installer.bat sekali lagi.
  pause
  exit /b 0
)
echo Mengunduh komponen, mohon tunggu beberapa menit...
call npm install
if errorlevel 1 goto gagal
call npm run dist
if errorlevel 1 goto gagal
echo.
echo Selesai! Installer ada di folder "dist" (CryptoAnalyzer-Setup-1.0.0.exe).
echo Klik dua kali file itu untuk memasang aplikasi. Setelah itu aplikasi dibuka dari ikon desktop atau Start Menu.
start "" "%~dp0dist"
pause
exit /b 0
:gagal
echo.
echo Terjadi kesalahan. Coba klik kanan Buat-Installer.bat lalu pilih "Run as administrator".
pause
exit /b 1
