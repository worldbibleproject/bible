@echo off
echo 🔄 Complete Restart Final
echo =======================

echo.
echo 🛑 Stopping all containers...
docker-compose down

echo.
echo ⏳ Waiting 10 seconds for cleanup...
timeout /t 10 /nobreak >nul

echo.
echo 🚀 Starting all containers fresh...
docker-compose up -d

echo.
echo ⏳ Waiting 30 seconds for containers to start...
timeout /t 30 /nobreak >nul

echo.
echo 📊 Checking container status...
docker-compose ps

echo.
echo 🔍 Testing backend health...
curl -f http://localhost:3001/health 2>nul
if %errorlevel% equ 0 (
    echo ✅ Backend is responding!
    echo.
    echo 🧪 Testing wizard API...
    curl -X POST http://localhost:3001/api/wizard/process -H "Content-Type: application/json" -d "{\"feeling\":\"lost\",\"barrier\":\"doubt\",\"heart\":\"seeking\",\"spiritual_background\":\"none\",\"life_stage\":\"adult\",\"preferred_style\":\"gentle\"}"
    echo.
    echo.
    echo 🎉 If you see AI-generated content above, the wizard is working!
    echo 🌐 You can now test it at: http://localhost:3000/wizard
) else (
    echo ❌ Backend is not responding
    echo.
    echo 📋 Checking logs...
    docker-compose logs backend --tail 10
)

echo.
echo 🎉 Complete restart finished!
echo.
pause
