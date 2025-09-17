@echo off
echo 🔧 Prisma Debian Fix Tool
echo =======================

echo.
echo 🐛 Found the issue: Alpine Linux SSL compatibility with Prisma
echo ✅ Fixed by switching to Debian-based image with proper SSL libraries
echo.

echo 🚀 Rebuilding backend container with Debian base image...
docker-compose up -d --build backend

echo.
echo ⏳ Waiting for backend to start...
timeout /t 30 /nobreak >nul

echo.
echo 🔍 Checking container status...
docker-compose ps

echo.
echo 📋 Checking backend logs...
docker-compose logs backend --tail 10

echo.
echo 🎉 Prisma Debian fix completed!
echo.
echo 📊 Now you can check your database:
echo    SIMPLE_DB_CHECK.bat
echo.
echo 📖 And import your Bible data:
echo    SIMPLE_IMPORT.bat
echo.
pause
