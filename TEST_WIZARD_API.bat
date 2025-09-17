@echo off
echo 🧪 Test Wizard API
echo ================

echo.
echo 🔍 Testing wizard endpoint...
curl -X POST http://localhost:3001/api/wizard/process -H "Content-Type: application/json" -d "{\"feeling\":\"lost\",\"barrier\":\"doubt\",\"heart\":\"seeking\",\"spiritual_background\":\"none\",\"life_stage\":\"adult\",\"preferred_style\":\"gentle\"}"

echo.
echo.
echo 🎉 Test completed!
echo.
pause
