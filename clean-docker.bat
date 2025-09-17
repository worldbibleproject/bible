@echo off
echo ========================================
echo    CLEANING DOCKER BUILD CACHE
echo ========================================
echo.

echo Stopping all services...
docker-compose down

echo.
echo Removing all containers and images...
docker-compose down --rmi all --volumes --remove-orphans

echo.
echo Cleaning Docker build cache...
docker system prune -f

echo.
echo ========================================
echo    CLEANUP COMPLETE!
echo ========================================
echo.
echo You can now run setup-windows.bat again.
echo.
pause

