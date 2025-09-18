@echo off
echo 🌊 Digital Ocean Deployment Script
echo ==================================
echo.

echo 📋 This script will help you deploy your evangelism platform to Digital Ocean.
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

echo 🔑 REQUIRED INFORMATION
echo ======================
echo.
echo You'll need the following information:
echo   - Digital Ocean API Token
echo   - Domain name (optional)
echo   - SSH key for server access
echo.

set /p DO_TOKEN="Enter your Digital Ocean API Token: "
set /p DOMAIN_NAME="Enter your domain name (or press Enter to skip): "
set /p SSH_KEY_NAME="Enter your SSH key name in Digital Ocean: "

echo.
echo 🚀 DEPLOYMENT OPTIONS
echo ====================
echo.
echo 1. Create new droplet and deploy
echo 2. Deploy to existing droplet
echo 3. Generate deployment commands only
echo.

set /p DEPLOY_OPTION="Choose option (1-3): "

if "%DEPLOY_OPTION%"=="1" goto create_droplet
if "%DEPLOY_OPTION%"=="2" goto existing_droplet
if "%DEPLOY_OPTION%"=="3" goto generate_commands
goto invalid_option

:create_droplet
echo.
echo 🆕 Creating new Digital Ocean droplet...
echo.

echo 📝 Droplet configuration:
echo   - Name: evangelism-app-prod
echo   - Size: s-2vcpu-4gb (recommended)
echo   - Image: ubuntu-22-04-x64
echo   - Region: nyc1 (or your preferred)
echo.

set /p DROPLET_SIZE="Enter droplet size (s-2vcpu-4gb): "
set /p DROPLET_REGION="Enter region (nyc1): "

echo.
echo 🔧 Creating droplet with doctl...
echo (Make sure doctl is installed: https://github.com/digitalocean/doctl)
echo.

echo doctl compute droplet create evangelism-app-prod ^
  --size %DROPLET_SIZE% ^
  --image ubuntu-22-04-x64 ^
  --region %DROPLET_REGION% ^
  --ssh-keys %SSH_KEY_NAME% ^
  --wait

echo.
echo ⏳ Waiting for droplet to be ready...
echo.

echo 📋 Next steps after droplet creation:
echo   1. SSH into your droplet: ssh root@YOUR_DROPLET_IP
echo   2. Run the deployment commands below
echo.

goto deployment_commands

:existing_droplet
echo.
echo 🖥️ Deploying to existing droplet...
echo.

set /p DROPLET_IP="Enter your droplet IP address: "

echo.
echo 📋 SSH into your droplet and run the deployment commands:
echo   ssh root@%DROPLET_IP%
echo.

goto deployment_commands

:generate_commands
echo.
echo 📝 Generating deployment commands...
echo.

goto deployment_commands

:deployment_commands
echo.
echo 🚀 DEPLOYMENT COMMANDS
echo =====================
echo.
echo Run these commands on your Digital Ocean droplet:
echo.

echo # 1. Update system
echo sudo apt update ^&^& sudo apt upgrade -y
echo.

echo # 2. Install Docker
echo curl -fsSL https://get.docker.com -o get-docker.sh
echo sudo sh get-docker.sh
echo sudo usermod -aG docker $USER
echo.

echo # 3. Install Docker Compose
echo sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
echo sudo chmod +x /usr/local/bin/docker-compose
echo.

echo # 4. Install Git
echo sudo apt install git -y
echo.

echo # 5. Clone your repository
echo git clone https://github.com/worldbibleproject/bible.git /opt/evangelism-app
echo cd /opt/evangelism-app
echo.

echo # 6. Create production environment file
echo cat ^> .env.production ^<^< EOF
echo DATABASE_URL="mysql://evangelism_user:CHANGE_THIS_PASSWORD@mysql:3306/evangelism_app"
echo JWT_SECRET="CHANGE_THIS_TO_A_STRONG_SECRET"
echo OPENAI_API_KEY="your-openai-api-key"
echo ZOOM_API_KEY="your-zoom-api-key"
echo ZOOM_API_SECRET="your-zoom-api-secret"
echo SMTP_HOST="smtp.sendgrid.net"
echo SMTP_PORT=587
echo SMTP_USER="apikey"
echo SMTP_PASS="your-sendgrid-api-key"
echo FRONTEND_URL="https://%DOMAIN_NAME%"
echo NEXT_PUBLIC_API_URL="https://%DOMAIN_NAME%/api"
echo NEXT_PUBLIC_WS_URL="wss://%DOMAIN_NAME%"
echo NEXT_PUBLIC_ZOOM_SDK_KEY="your-zoom-sdk-key"
echo EOF
echo.

echo # 7. Start the application
echo docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
echo.

echo # 8. Initialize database
echo docker-compose exec backend npx prisma db push
echo docker-compose exec backend npm run db:seed
echo.

echo # 9. Set up SSL certificate (if domain is configured)
if not "%DOMAIN_NAME%"=="" (
    echo sudo apt install certbot python3-certbot-nginx -y
    echo sudo certbot --nginx -d %DOMAIN_NAME%
)

echo.
echo 🎉 DEPLOYMENT COMPLETE!
echo ======================
echo.
echo Your evangelism platform should now be running at:
if not "%DOMAIN_NAME%"=="" (
    echo   https://%DOMAIN_NAME%
) else (
    echo   http://YOUR_DROPLET_IP
)
echo.
echo 📊 Monitoring available at:
echo   - Prometheus: http://YOUR_DROPLET_IP:9090
echo   - Grafana: http://YOUR_DROPLET_IP:3002
echo.
echo 🔧 Useful commands:
echo   - View logs: docker-compose logs -f
echo   - Restart services: docker-compose restart
echo   - Update application: git pull ^&^& docker-compose up -d --build
echo.

goto end

:invalid_option
echo ❌ Invalid option selected.
pause
exit /b 1

:end
echo.
echo 📚 Additional Resources:
echo   - Production Environment Setup: PRODUCTION_ENVIRONMENT_SETUP.md
echo   - Monitoring Guide: monitoring/prometheus.yml
echo   - Troubleshooting: PRODUCTION_DEPLOYMENT.md
echo.
pause
