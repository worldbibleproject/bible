@echo off
echo 🔍 Debug Wizard Error
echo ===================

echo.
echo 📋 Checking backend logs for wizard errors...
docker-compose logs backend --tail 15

echo.
echo 🔍 Testing wizard with detailed output...
curl -v -X POST http://localhost:3001/api/wizard/process -H "Content-Type: application/json" -d "{\"feeling\":\"lost\",\"barrier\":\"doubt\",\"heart\":\"seeking\",\"spiritual_background\":\"none\",\"life_stage\":\"adult\",\"preferred_style\":\"gentle\"}"

echo.
echo 🔍 Testing with minimal data...
curl -X POST http://localhost:3001/api/wizard/process -H "Content-Type: application/json" -d "{\"feeling\":\"lost\"}"

echo.
echo 🎉 Debug completed!
echo.
pause
