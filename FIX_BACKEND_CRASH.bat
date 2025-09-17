@echo off
echo 🔧 Fix Backend Crash
echo ==================

echo.
echo 🛑 Stopping all containers...
docker-compose down

echo.
echo ⏳ Waiting 5 seconds...
timeout /t 5 /nobreak >nul

echo.
echo 🚀 Starting containers fresh...
docker-compose up -d

echo.
echo ⏳ Waiting for containers to start...
timeout /t 20 /nobreak >nul

echo.
echo 📊 Checking container status...
docker-compose ps

echo.
echo 📋 Checking backend logs...
docker-compose logs backend --tail 10

echo.
echo 🔍 Testing backend health...
curl -f http://localhost:3001/health 2>nul
if %errorlevel% equ 0 (
    echo ✅ Backend is now responding!
    echo.
    echo 🎉 You can now test the wizard at: http://localhost:3000/wizard
) else (
    echo ❌ Backend is still not responding
    echo.
    echo 🔍 Check the logs above for errors
)

echo.
echo 🎉 Fix completed!
echo.
pause
