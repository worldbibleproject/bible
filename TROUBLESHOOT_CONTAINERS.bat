@echo off
echo 🔧 Container Troubleshooting Tool
echo ================================

echo.
echo 🔍 Step 1: Check all containers
echo.
docker ps -a

echo.
echo 📋 Step 2: Check backend logs
echo.
docker-compose logs backend --tail 20

echo.
echo 🔄 Step 3: Stop all containers
echo.
docker-compose down

echo.
echo ⏳ Step 4: Wait 5 seconds
echo.
timeout /t 5 /nobreak >nul

echo.
echo 🚀 Step 5: Start containers fresh
echo.
docker-compose up -d

echo.
echo ⏳ Step 6: Wait for containers to start
echo.
timeout /t 30 /nobreak >nul

echo.
echo 🔍 Step 7: Check container status
echo.
docker-compose ps

echo.
echo 📊 Step 8: Test database connection
echo.
docker-compose exec backend npx prisma db push

echo.
echo 🎉 Troubleshooting completed!
echo.
pause
