@echo off
echo 🔍 Check Wizard Errors
echo ===================

echo.
echo 📋 Checking backend logs for wizard errors...
docker-compose logs backend --tail 20

echo.
echo 🔍 Testing wizard with more detailed output...
curl -v -X POST http://localhost:3001/api/wizard/process -H "Content-Type: application/json" -d "{\"feeling\":\"lost\",\"barrier\":\"doubt\",\"heart\":\"seeking\",\"spiritual_background\":\"none\",\"life_stage\":\"adult\",\"preferred_style\":\"gentle\"}"

echo.
echo 🎉 Check completed!
echo.
pause
