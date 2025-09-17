@echo off
echo 🔧 Rebuild and Test Import
echo =========================

echo.
echo 🚀 Rebuilding backend container with debug info...
docker-compose up -d --build backend

echo.
echo ⏳ Waiting for backend to start...
timeout /t 15 /nobreak >nul

echo.
echo 🔍 Checking container status...
docker-compose ps

echo.
echo 📖 Testing import with debug info...
echo.

docker-compose exec backend npx tsx src/scripts/import-csv-bible.ts

echo.
echo 🎉 Test completed!
echo.
pause
