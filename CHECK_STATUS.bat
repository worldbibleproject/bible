@echo off
echo 🔍 Evangelism App Status Check
echo =============================

echo.
echo 📊 Container Status:
docker-compose ps

echo.
echo 🔍 Backend Health Check:
curl -f http://localhost:3001/health 2>nul
if %errorlevel% equ 0 (
    echo ✅ Backend is healthy and responding
) else (
    echo ❌ Backend is not responding
)

echo.
echo 🌐 Frontend Check:
curl -f http://localhost:3000 2>nul
if %errorlevel% equ 0 (
    echo ✅ Frontend is accessible
) else (
    echo ❌ Frontend is not accessible
)

echo.
echo 📋 Backend Logs (last 10 lines):
docker-compose logs backend --tail 10

echo.
echo 🎉 Status check completed!
echo.
pause
