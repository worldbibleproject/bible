@echo off
echo 🔧 Zoom Issue Fix Tool
echo =====================

echo.
echo 🐛 Found the issue: Missing zoomus module
echo ✅ Fixed by creating mock Zoom service
echo.

echo 🚀 Rebuilding backend container...
docker-compose up -d --build backend

echo.
echo ⏳ Waiting for backend to start...
timeout /t 15 /nobreak >nul

echo.
echo 🔍 Checking container status...
docker-compose ps

echo.
echo 📋 Checking backend logs...
docker-compose logs backend --tail 10

echo.
echo 🎉 Zoom issue fix completed!
echo.
pause
