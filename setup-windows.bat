@echo off
echo ========================================
echo Evangelism App - Windows Setup Script
echo ========================================
echo.

echo Checking prerequisites...
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed or not in PATH
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo ✅ Docker is installed

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)
echo ✅ Docker is running

echo.
echo Setting up environment files...
echo.

REM Create backend .env file if it doesn't exist
if not exist "backend\.env" (
    echo Creating backend .env file...
    copy "backend\env.example" "backend\.env"
    echo ✅ Created backend\.env
) else (
    echo ✅ backend\.env already exists
)

echo.
echo Building and starting containers...
echo.

REM Stop any existing containers
echo Stopping existing containers...
docker-compose down

REM Build and start containers
echo Building containers...
docker-compose build

echo Starting containers...
docker-compose up -d

echo.
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo Setting up database...
echo.

REM Run database migrations
echo Running database migrations...
docker-compose exec backend npx prisma db push

REM Generate Prisma client
echo Generating Prisma client...
docker-compose exec backend npx prisma generate

REM Seed database
echo Seeding database...
docker-compose exec backend npx prisma db seed

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Your application is now running:
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:5000
echo 🗄️ Database: localhost:3306
echo.
echo Default login credentials:
echo Admin: admin@evangelismapp.com / admin123
echo Mentor: mentor1@example.com / mentor123
echo Seeker: seeker1@example.com / seeker123
echo.
echo To stop the application:
echo docker-compose down
echo.
echo To view logs:
echo docker-compose logs -f
echo.
echo To restart:
echo docker-compose restart
echo.
pause
