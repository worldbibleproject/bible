@echo off
echo 🗄️ Database Browser Tool
echo ======================

echo.
echo 🔍 Checking container status...
docker-compose ps

echo.
echo ⏳ Waiting for containers to be ready...
timeout /t 10 /nobreak >nul

echo.
echo 📊 Opening Prisma Studio (Database Browser)...
echo.
echo 🌐 Prisma Studio will open in your browser at: http://localhost:5555
echo 📋 You can browse all tables and data visually
echo.

docker-compose exec backend npx prisma studio --browser none

echo.
echo 🎉 Prisma Studio should be open in your browser!
echo.
pause
