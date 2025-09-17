@echo off
echo ========================================
echo   EVANGELISM APP - COMPLETE SETUP
echo ========================================
echo.

echo [1/10] Checking prerequisites...
echo.

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js is installed

REM Check Docker Desktop
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Desktop is not installed. Please install from https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)
echo ✅ Docker Desktop is installed

REM Check if Docker Desktop is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Desktop is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo ✅ Docker Desktop is running

REM Check Git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed. Please install Git from https://git-scm.com/
    pause
    exit /b 1
)
echo ✅ Git is installed

echo.
echo [2/10] Setting up environment files...
echo.

REM Create backend .env if it doesn't exist
if not exist "backend\.env" (
    echo Creating backend\.env...
    copy "backend\env.example" "backend\.env" >nul
    echo ✅ Created backend\.env
) else (
    echo ✅ backend\.env already exists
)

REM Create frontend .env.local if it doesn't exist
if not exist "frontend\.env.local" (
    echo Creating frontend\.env.local...
    echo NEXT_PUBLIC_API_URL=http://localhost:3001 > "frontend\.env.local"
    echo NEXT_PUBLIC_WS_URL=ws://localhost:3001 >> "frontend\.env.local"
    echo ✅ Created frontend\.env.local
) else (
    echo ✅ frontend\.env.local already exists
)

echo.
echo [3/10] API Keys Setup Required...
echo.
echo 🔑 REQUIRED API KEYS:
echo.
echo 1. OpenAI API Key (for AI wizard):
echo    - Go to: https://platform.openai.com/api-keys
echo    - Create new API key
echo    - Add to backend\.env: OPENAI_API_KEY="sk-..."
echo.
echo 2. Gmail SMTP (for invitations):
echo    - Enable 2FA on your Gmail account
echo    - Go to: https://myaccount.google.com/apppasswords
echo    - Create App Password for "Mail"
echo    - Add to backend\.env: SMTP_USER="your@gmail.com"
echo    - Add to backend\.env: SMTP_PASS="your-app-password"
echo.
echo 3. Zoom API (for video calls):
echo    - Go to: https://marketplace.zoom.us/
echo    - Create JWT App
echo    - Get API Key and Secret
echo    - Add to backend\.env: ZOOM_API_KEY="your-key"
echo    - Add to backend\.env: ZOOM_API_SECRET="your-secret"
echo.
echo 4. JWT Secret (for authentication):
echo    - Generate random 32+ character string
echo    - Add to backend\.env: JWT_SECRET="your-random-secret"
echo.
echo ⚠️  IMPORTANT: Update backend\.env with your API keys before continuing!
echo.
pause

echo.
echo [4/10] Installing dependencies...
echo.

echo Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)

echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

echo Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo ✅ Dependencies installed successfully

echo.
echo [5/10] Building Docker images...
echo.

REM Set environment variables for Docker build
set OPENAI_API_KEY=your_openai_api_key_here
set SMTP_USER=your_email@gmail.com
set SMTP_PASS=your_app_password_here
set JWT_SECRET=your_jwt_secret_here
set DATABASE_URL=mysql://root:password@db:3306/evangelism_app
set ZOOM_API_KEY=your_zoom_api_key_here
set ZOOM_API_SECRET=your_zoom_api_secret_here

echo Building Docker images...
docker-compose build
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
    pause
    exit /b 1
)

echo ✅ Docker images built successfully

echo.
echo [6/10] Starting services...
echo.

docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ Failed to start services
    pause
    exit /b 1
)

echo ✅ Services started successfully

echo.
echo [7/10] Setting up database...
echo.

REM Wait for database to be ready
echo Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Run database migrations
docker-compose exec backend npx prisma db push
if %errorlevel% neq 0 (
    echo ❌ Failed to setup database
    pause
    exit /b 1
)

echo ✅ Database setup complete

echo.
echo [8/10] Seeding database...
echo.

docker-compose exec backend npx tsx src/seed.ts
if %errorlevel% neq 0 (
    echo ❌ Failed to seed database
    pause
    exit /b 1
)

echo ✅ Database seeded successfully

echo.
echo [9/10] Running data import scripts...
echo.

echo Importing sample churches...
docker-compose exec backend npx tsx src/scripts/import-churches.ts

echo Importing sample Bible verses...
docker-compose exec backend npx tsx src/scripts/import-bible-verses.ts

echo Importing sample users...
docker-compose exec backend npx tsx src/scripts/import-users.ts

echo ✅ Data import complete

echo.
echo [10/10] Setup complete!
echo.

echo ========================================
echo   🎉 EVANGELISM APP IS READY!
echo ========================================
echo.
echo 🌐 Access your application:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:3001
echo.
echo 👤 Default Admin Login:
echo    Email:    admin@evangelismapp.com
echo    Password: admin123
echo.
echo 📊 Database Tables Created:
echo    - users (user accounts)
echo    - seeker_profiles (seeker details)
echo    - mentor_profiles (mentor details)
echo    - churches (church database)
echo    - sessions (1-on-1 sessions)
echo    - group_sessions (group sessions)
echo    - messages (chat messages)
echo    - notifications (system alerts)
echo    - bible_verses_web (Bible database)
echo    - And 10+ more tables...
echo.
echo 🎥 Video Calling Features:
echo    - Zoom integration ready
echo    - Automatic meeting creation
echo    - Calendar-based scheduling
echo    - Mentor availability management
echo.
echo 🤖 AI Features:
echo    - Mini Bible Wizard
echo    - Mentor matching algorithm
echo    - Personalized spiritual guidance
echo.
echo 📧 Email Features:
echo    - User invitations
echo    - Password reset
echo    - Session notifications
echo.
echo ========================================
echo    NEXT STEPS
echo ========================================
echo.
echo 1. Update API keys in backend\.env:
echo    - OpenAI API Key (required for AI wizard)
echo    - Gmail SMTP (required for invitations)
echo    - Zoom API (required for video calls)
echo    - JWT Secret (required for authentication)
echo.
echo 2. Restart services after updating API keys:
echo    docker-compose restart
echo.
echo 3. Import your own data:
echo    - Edit backend\src\scripts\import-*.ts files
echo    - Run: docker-compose exec backend npx tsx src/scripts/import-*.ts
echo.
echo 4. Access admin dashboard:
echo    - Go to: http://localhost:3000/admin
echo    - Login with admin credentials
echo    - Manage users, churches, and system
echo.
echo ========================================
echo    TROUBLESHOOTING
echo ========================================
echo.
echo If you encounter issues:
echo 1. Check Docker Desktop is running
echo 2. Verify API keys in backend\.env
echo 3. Check logs: docker-compose logs
echo 4. Restart services: docker-compose restart
echo 5. Clean restart: docker-compose down && docker-compose up -d
echo.
echo For support, check the documentation files:
echo - README.md
echo - SETUP_GUIDE.md
echo - API_INTEGRATION_GUIDE.md
echo - VIDEO_CALLING_SETUP_GUIDE.md
echo.
pause
