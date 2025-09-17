@echo off
echo 📊 Simple Database Check
echo =======================

echo.
echo 🔍 Checking if containers are running...
docker-compose ps

echo.
echo ⏳ Waiting for containers to be ready...
timeout /t 10 /nobreak >nul

echo.
echo 📋 Testing database connection...
docker-compose exec backend npx prisma db push

echo.
echo 📖 Checking Bible verses table...
echo.
docker-compose exec backend npx tsx src/scripts/check-database.ts

echo.
echo 🎉 Database check completed!
echo.
pause
