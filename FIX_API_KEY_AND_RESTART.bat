@echo off
echo 🔧 Fix API Key and Restart
echo =========================

echo.
echo 📊 Checking container status...
docker-compose ps

echo.
echo 🔍 Checking environment file...
type backend\.env | findstr OPENAI

echo.
echo 📝 Please edit the environment file:
echo    1. Open: backend\.env
echo    2. Find: OPENAI_API_KEY="your-openai-api-key-here"
echo    3. Replace with your actual API key
echo    4. Save the file
echo.
echo Press any key after you've updated the API key...
pause

echo.
echo 🚀 Restarting backend container...
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
) else (
    echo ❌ Backend is not responding
    echo.
    echo 📋 Checking logs...
    docker-compose logs backend --tail 10
)

echo.
echo 🎉 Fix completed!
echo.
pause
