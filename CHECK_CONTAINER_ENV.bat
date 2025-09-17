@echo off
echo 🔍 Check Container Environment
echo ============================

echo.
echo 📋 Checking what environment variables the container sees...
docker-compose exec backend env | findstr OPENAI

echo.
echo 📋 Checking all environment variables...
docker-compose exec backend env | findstr -i "openai\|api"

echo.
echo 📋 Checking if the .env file is being mounted correctly...
docker-compose exec backend ls -la /app/.env

echo.
echo 📋 Checking the content of .env file inside container...
docker-compose exec backend cat /app/.env | findstr OPENAI

echo.
echo 🎉 Environment check completed!
echo.
pause
