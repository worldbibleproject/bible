@echo off
echo ========================================
echo    RETRYING SETUP AFTER FIXES
echo ========================================
echo.

echo Cleaning up previous Docker build...
docker-compose down --rmi all --volumes --remove-orphans

echo.
echo Running setup again...
setup-windows.bat

