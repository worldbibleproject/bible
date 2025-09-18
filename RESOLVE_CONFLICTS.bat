@echo off
echo 🔧 Conflict Resolution Tool
echo ===========================
echo.

echo 📋 This script will resolve all merge conflicts by keeping your local versions.
echo.

REM Check if git is available
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Git is not installed. Please install Git first.
    pause
    exit /b 1
)

echo ✅ Git is available
echo.

echo 🔍 Current status:
git status --porcelain
echo.

echo 🔧 Resolving conflicts by keeping local versions...
echo.

REM Resolve all conflicts by keeping local versions
git checkout --ours .

echo 📝 Adding all resolved files...
git add .

echo 💾 Committing resolved conflicts...
git commit -m "Resolve merge conflicts - keep local versions with Zoom integration and production optimizations"

echo.
echo 📤 Pushing to GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo ❌ Push failed. Trying force push...
    echo.
    set /p FORCE_PUSH="Do you want to force push? (y/N): "
    if /i "%FORCE_PUSH%"=="y" (
        echo 🔄 Force pushing...
        git push origin main --force
        if %errorlevel% neq 0 (
            echo ❌ Force push failed.
            echo.
            echo 🔧 Manual steps needed:
            echo   1. Check git status: git status
            echo   2. Check remote: git remote -v
            echo   3. Try: git push origin main --force-with-lease
            echo.
            pause
            exit /b 1
        ) else (
            echo ✅ Force push successful
        )
    ) else (
        echo ❌ Push cancelled by user
        pause
        exit /b 1
    )
) else (
    echo ✅ Push successful
)

echo.
echo 🎉 CONFLICTS RESOLVED!
echo =====================
echo.

echo 📊 Final status:
git status --porcelain
echo.

echo 🌐 Your repository is now available at:
echo    https://github.com/worldbibleproject/bible
echo.

echo 🚀 Ready for Digital Ocean deployment!
echo    Run: DEPLOY_TO_DIGITAL_OCEAN.bat
echo.

pause
