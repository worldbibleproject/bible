@echo off
echo 🔍 Wizard Troubleshooting
echo =======================

echo.
echo 📊 Checking container status...
docker-compose ps

echo.
echo 📋 Checking backend logs...
docker-compose logs backend --tail 15

echo.
echo 🔍 Testing backend health...
curl -f http://localhost:3001/health 2>nul
if %errorlevel% equ 0 (
    echo ✅ Backend is responding
) else (
    echo ❌ Backend is not responding
)

echo.
echo 🔍 Testing wizard endpoint...
curl -f http://localhost:3001/api/wizard 2>nul
if %errorlevel% equ 0 (
    echo ✅ Wizard endpoint is accessible
) else (
    echo ❌ Wizard endpoint is not accessible
)

echo.
echo 🔍 Checking environment file...
if exist "backend\.env" (
    echo ✅ Environment file exists
    findstr "OPENAI_API_KEY" backend\.env
) else (
    echo ❌ Environment file not found
)

echo.
echo 🎉 Troubleshooting completed!
echo.
pause
