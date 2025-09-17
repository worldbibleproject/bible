@echo off
echo 🔧 Prisma SSL Fix Tool
echo ====================

echo.
echo 🐛 Found the issue: Missing SSL libraries for Prisma
echo ✅ Fixed by adding openssl and libssl1.1 to Dockerfile
echo.

echo 🚀 Rebuilding backend container with SSL libraries...
docker-compose up -d --build backend

echo.
echo ⏳ Waiting for backend to start...
timeout /t 25 /nobreak >nul

echo.
echo 🔍 Checking container status...
docker-compose ps

echo.
echo 📋 Checking backend logs...
docker-compose logs backend --tail 10

echo.
echo 🎉 Prisma SSL fix completed!
echo.
echo 📊 Now you can check your database:
echo    SIMPLE_DB_CHECK.bat
echo.
echo 📖 And import your Bible data:
echo    SIMPLE_IMPORT.bat
echo.
pause
