@echo off
echo ========================================
echo Evangelism App - Push to GitHub
echo ========================================
echo.

REM Set Git user identity
git config user.email "cljphotographer@gmail.com"
git config user.name "Jeffrey Gross"

echo Checking Git status...
git status

echo.
echo Adding all files...
git add -A

echo.
echo Committing changes...
git commit -m "Complete evangelism platform with video calling, scheduling, and all features"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo Push Complete!
echo ========================================
echo.
echo Your code has been pushed to GitHub.
echo You can now deploy to Digital Ocean using:
echo DEPLOY_TO_DIGITAL_OCEAN.bat
echo.
pause
