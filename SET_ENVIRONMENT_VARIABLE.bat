@echo off
echo 🔧 Set Environment Variable
echo ==========================

echo.
echo 🔍 Setting OPENAI_API_KEY environment variable...
set OPENAI_API_KEY=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

echo.
echo 🔍 Verifying environment variable is set...
echo OPENAI_API_KEY=%OPENAI_API_KEY%

echo.
echo 🚀 Restarting backend with environment variable...
docker-compose restart backend

echo.
echo ⏳ Waiting for backend to start...
timeout /t 15 /nobreak >nul

echo.
echo 🔍 Testing wizard API...
curl -X POST http://localhost:3001/api/wizard/process -H "Content-Type: application/json" -d "{\"feeling\":\"lost\",\"barrier\":\"doubt\",\"heart\":\"seeking\",\"spiritual_background\":\"none\",\"life_stage\":\"adult\",\"preferred_style\":\"gentle\"}"

echo.
echo.
echo 🎉 If you see AI-generated content above, the wizard is working!
echo 🌐 You can now test it at: http://localhost:3000/wizard

echo.
echo 🎉 Environment variable set!
echo.
pause
