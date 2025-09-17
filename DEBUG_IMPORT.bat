@echo off
echo 🔍 Debug Bible Import
echo ===================

echo.
echo 🔍 Running debug import to see what's happening...
echo.

docker-compose exec backend npx tsx src/scripts/debug-import.ts

echo.
echo 🎉 Debug completed!
echo.
pause
