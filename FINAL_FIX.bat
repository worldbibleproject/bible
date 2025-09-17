@echo off
echo 🔧 Final Backend Fix Tool
echo ========================

echo.
echo 🐛 Found the issue: Video routes causing crashes
echo ✅ Fixed by temporarily disabling video routes
echo.

echo 🚀 Rebuilding backend container...
docker-compose up -d --build backend

echo.
echo ⏳ Waiting for backend to start...
timeout /t 20 /nobreak >nul

echo.
echo 🔍 Checking container status...
docker-compose ps

echo.
echo 📋 Checking backend logs...
docker-compose logs backend --tail 15

echo.
echo 🎉 Final fix completed!
echo.
echo 📊 Now you can check your database:
echo    SIMPLE_DB_CHECK.bat
echo.
echo 📖 And import your Bible data:
echo    SIMPLE_IMPORT.bat
echo.
pause
