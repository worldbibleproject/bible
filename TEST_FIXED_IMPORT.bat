@echo off
echo 🔧 Test Fixed Import
echo ==================

echo.
echo 🚀 Rebuilding backend with fixed CSV parser...
docker-compose up -d --build backend

echo.
echo ⏳ Waiting for backend to start...
timeout /t 15 /nobreak >nul

echo.
echo 📖 Testing fixed import...
echo.

docker-compose exec backend npx tsx src/scripts/import-csv-bible.ts

echo.
echo 🎉 Test completed!
echo.
pause
