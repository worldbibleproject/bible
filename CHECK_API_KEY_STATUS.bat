@echo off
echo 🔍 Check API Key Status
echo =====================

echo.
echo 📋 Checking backend logs for latest errors...
docker-compose logs backend --tail 20

echo.
echo 🔍 Testing if API key is now being read correctly...
curl -X POST http://localhost:3001/api/wizard/process -H "Content-Type: application/json" -d "{\"feeling\":\"lost\",\"barrier\":\"doubt\",\"heart\":\"seeking\",\"spiritual_background\":\"none\",\"life_stage\":\"adult\",\"preferred_style\":\"gentle\"}" 2>&1

echo.
echo.
echo 🔍 Testing with a simple request...
curl -X POST http://localhost:3001/api/wizard/process -H "Content-Type: application/json" -d "{\"feeling\":\"lost\"}" 2>&1

echo.
echo 🎉 Check completed!
echo.
pause
