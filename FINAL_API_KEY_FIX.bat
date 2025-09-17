@echo off
echo 🔧 Final API Key Fix
echo ==================

echo.
echo 🔍 I've hardcoded the API key directly in docker-compose.yml
echo 🚀 Restarting backend with the hardcoded API key...
docker-compose restart backend

echo.
echo ⏳ Waiting for backend to start...
timeout /t 15 /nobreak >nul

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
echo 🎉 Final fix completed!
echo.
pause
