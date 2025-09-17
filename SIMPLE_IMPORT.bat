@echo off
echo 📖 Simple Bible Import
echo ====================

echo.
echo 🔍 Checking if CSV file exists...
if not exist "backend\bible-verses.csv" (
    echo ❌ CSV file not found!
    echo.
    echo 📁 Please place your CSV file at: backend\bible-verses.csv
    echo.
    pause
    exit /b 1
)

echo ✅ CSV file found!
echo.

echo 🔍 Checking container status...
docker-compose ps

echo.
echo ⏳ Waiting for containers to be ready...
timeout /t 15 /nobreak >nul

echo.
echo 📋 Testing database connection...
docker-compose exec backend npx prisma db push

echo.
echo 📖 Importing Bible verses...
echo.

REM Run the CSV import script
docker-compose exec backend npx tsx src/scripts/import-csv-bible.ts

echo.
echo 🎉 Import test completed!
echo.
pause
