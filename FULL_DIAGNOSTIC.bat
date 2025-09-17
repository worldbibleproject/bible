@echo off
echo 🔍 Full Diagnostic
echo =================

echo.
echo 📊 Container Status:
docker-compose ps

echo.
echo 🔍 Backend Logs (last 10 lines):
docker-compose logs backend --tail 10

echo.
echo 🔍 Environment Variable Check:
echo OPENAI_API_KEY=%OPENAI_API_KEY%

echo.
echo 🔍 Testing Backend Health:
curl -f http://localhost:3001/health 2>nul
if %errorlevel% equ 0 (
    echo ✅ Backend is responding
) else (
    echo ❌ Backend is not responding
)

echo.
echo 🔍 Testing Wizard API:
curl -X POST http://localhost:3001/api/wizard/process -H "Content-Type: application/json" -d "{\"feeling\":\"lost\",\"barrier\":\"doubt\",\"heart\":\"seeking\",\"spiritual_background\":\"none\",\"life_stage\":\"adult\",\"preferred_style\":\"gentle\"}"

echo.
echo.
echo 🔍 Testing Frontend:
curl -f http://localhost:3000 2>nul
if %errorlevel% equ 0 (
    echo ✅ Frontend is accessible
) else (
    echo ❌ Frontend is not accessible
)

echo.
echo 🎉 Diagnostic completed!
echo.
pause
