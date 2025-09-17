@echo off
echo 🔧 Rebuild with API Key
echo =====================

echo.
echo 🔍 Checking current API key in environment file...
type backend\.env | findstr OPENAI

echo.
echo 🚀 Rebuilding backend container to pick up API key changes...
docker-compose up -d --build backend

echo.
echo ⏳ Waiting for backend to start...
timeout /t 20 /nobreak >nul

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
) else (
    echo ❌ Backend is not responding
    echo.
    echo 📋 Checking logs...
    docker-compose logs backend --tail 10
)

echo.
echo 🎉 Rebuild completed!
echo.
pause
