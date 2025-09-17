@echo off
echo 📊 Database Table Checker
echo =========================

echo.
echo 🔍 Checking container status...
docker-compose ps

echo.
echo ⏳ Waiting for containers to be ready...
timeout /t 5 /nobreak >nul

echo.
echo 📋 Checking database contents...
echo.

docker-compose exec backend npx tsx src/scripts/check-database.ts

echo.
echo 🎉 Database check completed!
echo.
pause
