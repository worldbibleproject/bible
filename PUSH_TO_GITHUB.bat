@echo off
echo 🐙 Push to GitHub
echo ===============

echo.
echo 🔍 Checking if git is initialized...
if not exist ".git" (
    echo 📁 Initializing git repository...
    git init
) else (
    echo ✅ Git repository already initialized
)

echo.
echo 📋 Checking current git status...
git status

echo.
echo 📝 Adding all files to git...
git add .

echo.
echo 👤 Setting up git user identity...
set GIT_EMAIL=cljphotographer@gmail.com
set GIT_NAME=Jeffrey Gross
echo    Email: %GIT_EMAIL%
echo    Name: %GIT_NAME%
git config user.email "%GIT_EMAIL%"
git config user.name "%GIT_NAME%"

echo.
echo 💾 Committing changes...
git commit -m "Initial commit: Evangelism platform with AI wizard, mentorship system, and church connections"

echo.
echo 🔗 Using your GitHub repository URL:
set GITHUB_URL=https://github.com/worldbibleproject/bible.git
echo    %GITHUB_URL%

echo.
echo 🚀 Adding GitHub remote...
git remote add origin %GITHUB_URL%

echo.
echo 📤 Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo 🎉 Code pushed to GitHub successfully!
echo 🌐 Your repository is now available at: https://github.com/worldbibleproject/bible
echo.
pause
