@echo off
echo 📊 Database Check Tool
echo ====================

echo.
echo 🔍 Checking container status...
docker-compose ps

echo.
echo ⏳ Waiting for containers to be ready...
timeout /t 5 /nobreak >nul

echo.
echo 📋 Checking if backend container is running...
docker-compose exec backend echo "Backend container is ready!" 2>nul
if %errorlevel% neq 0 (
    echo ❌ Backend container is not ready yet!
    echo.
    echo 🔧 Troubleshooting steps:
    echo 1. Wait a few more seconds for containers to start
    echo 2. Check logs: docker-compose logs backend
    echo 3. Restart if needed: docker-compose restart
    echo.
    pause
    exit /b 1
)

echo ✅ Backend container is ready!
echo.

echo 📖 Checking Bible verses table...
echo.
docker-compose exec backend npx prisma db execute --stdin << "EOF"
SELECT COUNT(*) as total_verses FROM bible_verses_web;
EOF

echo.
echo 📊 Sample Bible verses (first 5):
echo.
docker-compose exec backend npx prisma db execute --stdin << "EOF"
SELECT book, chapter, verse, LEFT(text, 50) as text_preview FROM bible_verses_web LIMIT 5;
EOF

echo.
echo 📚 Books in database:
echo.
docker-compose exec backend npx prisma db execute --stdin << "EOF"
SELECT DISTINCT book, COUNT(*) as verse_count FROM bible_verses_web GROUP BY book ORDER BY book LIMIT 10;
EOF

echo.
echo 🎉 Database check completed!
echo.
pause
