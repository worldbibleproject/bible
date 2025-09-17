@echo off
echo ========================================
echo    EVANGELISM APP - WINDOWS SETUP
echo ========================================
echo.

echo [1/8] Checking prerequisites...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    echo Then run this script again.
    pause
    exit /b 1
)
echo ✅ Node.js is installed

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Desktop is not installed!
    echo Please download and install Docker Desktop from https://www.docker.com/products/docker-desktop/
    echo Then run this script again.
    pause
    exit /b 1
)
echo ✅ Docker Desktop is installed

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Desktop is not running!
    echo Please start Docker Desktop and wait for it to fully load.
    echo Look for the Docker whale icon in your system tray - it should be green.
    echo Then run this script again as Administrator.
    pause
    exit /b 1
)
echo ✅ Docker Desktop is running

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed!
    echo Please download and install Git from https://git-scm.com/download/win
    echo Then run this script again.
    pause
    exit /b 1
)
echo ✅ Git is installed

echo.
echo [2/8] Setting up environment files...
echo.

REM Copy environment files
if not exist "backend\.env" (
    copy "backend\env.example" "backend\.env"
    echo ✅ Created backend\.env
) else (
    echo ✅ backend\.env already exists
)

if not exist "frontend\.env.local" (
    copy "frontend\.env.example" "frontend\.env.local"
    echo ✅ Created frontend\.env.local
) else (
    echo ✅ frontend\.env.local already exists
)

echo.
echo [3/8] Setting up environment variables...
echo.

REM Set required environment variables for Docker
set OPENAI_API_KEY=your_openai_api_key_here
set SMTP_USER=your_email@gmail.com
set SMTP_PASS=your_app_password_here
set JWT_SECRET=your_jwt_secret_here
set DATABASE_URL=mysql://root:password@db:3306/evangelism_app
set ZOOM_API_KEY=your_zoom_api_key_here
set ZOOM_API_SECRET=your_zoom_api_secret_here

echo ✅ Environment variables set for Docker build
echo.
echo [4/8] Installing dependencies...
echo.

REM Install root dependencies
echo Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [5/8] Building Docker images...
echo.

REM Build Docker images
echo Building Docker images...
call docker-compose build
if %errorlevel% neq 0 (
    echo ❌ Failed to build Docker images
    echo.
    echo Common solutions:
    echo 1. Make sure Docker Desktop is running and fully loaded
    echo 2. Run this script as Administrator
    echo 3. Restart Docker Desktop if it's stuck
    echo 4. Check if Windows Hyper-V is enabled
    echo 5. Try: docker-compose down --rmi all
    echo 6. Then run this script again
    echo.
    echo If you see "npm ci" errors, the Dockerfiles have been fixed.
    echo Try running the script again.
    pause
    exit /b 1
)

echo.
echo [6/8] Starting services...
echo.

REM Start services
echo Starting services...
call docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ Failed to start services
    pause
    exit /b 1
)

echo.
echo [7/8] Waiting for services to be ready...
echo.

REM Wait for services to be ready
timeout /t 30 /nobreak >nul

echo.
echo [8/8] Setting up database...
echo.

REM Setup database
echo Setting up database...
call docker-compose exec -T backend npx prisma db push
if %errorlevel% neq 0 (
    echo ❌ Failed to setup database
    pause
    exit /b 1
)

echo Seeding database...
call docker-compose exec -T backend npm run db:seed
if %errorlevel% neq 0 (
    echo ❌ Failed to seed database
    pause
    exit /b 1
)

echo.
echo [9/9] Final checks...
echo.

REM Check if services are running
echo Checking service status...
call docker-compose ps

echo.
echo ========================================
echo           SETUP COMPLETE!
echo ========================================
echo.
echo 🎉 Your Evangelism App is now running!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:3001
echo 🗄️  Database: localhost:3306
echo.
echo 👤 Test Accounts:
echo    Admin: admin@evangelismapp.com / admin123
echo    Seeker: seeker@example.com / seeker123
echo    Mentor: mentor@example.com / mentor123
echo    Church Finder: churchfinder@example.com / church123
echo.
echo 📚 Next Steps:
echo 1. Open http://localhost:3000 in your browser
echo 2. Try the Mini Bible Wizard
echo 3. Test user registration and login
echo 4. Explore the mentor matching system
echo.
echo 🔧 To stop the services: docker-compose down
echo 🔧 To view logs: docker-compose logs -f
echo 🔧 To restart: docker-compose restart
echo.
echo ========================================
echo    IMPORTANT NOTES
echo ========================================
echo.
echo ⚠️  You need to configure these APIs for full functionality:
echo.
echo 1. OpenAI API (Required for Wizard):
echo    - Get API key from https://platform.openai.com/
echo    - Update backend\.env: OPENAI_API_KEY=your_key_here
echo.
echo 2. Email Service (Required for invitations):
echo    - Gmail: Enable 2FA, create App Password
echo    - Update backend\.env: SMTP_USER=your_email, SMTP_PASS=your_app_password
echo.
echo 3. Video Meeting (Required for video calls):
echo    - Zoom: Get API credentials from https://marketplace.zoom.us/
echo    - Create JWT app, get API Key and Secret
echo    - Update backend\.env: ZOOM_API_KEY=your_key, ZOOM_API_SECRET=your_secret
echo.
echo ========================================
echo    TROUBLESHOOTING
echo ========================================
echo.
echo If you encounter issues:
echo 1. Check Docker Desktop is running (green whale icon)
echo 2. Run this script as Administrator
echo 3. Restart Docker Desktop
echo 4. Check Windows Hyper-V is enabled
echo 5. See WINDOWS_SETUP_GUIDE.md for detailed help
echo.
echo ========================================
echo.

REM Open browser
echo Opening browser...
start http://localhost:3000

echo.
echo Press any key to exit...
pause >nul

