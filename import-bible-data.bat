@echo off
echo 📖 Bible Data Import Tool
echo ========================

echo.
echo 📝 Instructions:
echo 1. Place your CSV file at: backend\bible-verses.csv
echo 2. Make sure Docker is running
echo 3. Run this script
echo.

echo 🔍 Checking if CSV file exists...
if not exist "backend\bible-verses.csv" (
    echo ❌ CSV file not found!
    echo.
    echo 📁 Please place your CSV file at: backend\bible-verses.csv
    echo 📝 Expected format:
    echo    Verse ID	Book Name	Book Number	Chapter	Verse	Text
    echo    1	Genesis	1	1	1	In the beginning God created the heavens and the earth.
    echo.
    pause
    exit /b 1
)

echo ✅ CSV file found!
echo.

echo 🚀 Starting import process...
echo.

docker-compose exec backend npx tsx src/scripts/import-csv-bible.ts

echo.
echo 🎉 Import process completed!
echo.
echo 📊 Check the output above for import results.
echo.
pause
