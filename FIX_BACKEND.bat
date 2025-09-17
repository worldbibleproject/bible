@echo off
echo 🔧 Backend Fix Tool
echo ==================

echo.
echo 🐛 Found the issue: nodemailer.createTransporter should be createTransport
echo ✅ Fixed the email.ts file
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
echo 🎉 Backend fix completed!
echo.
pause
