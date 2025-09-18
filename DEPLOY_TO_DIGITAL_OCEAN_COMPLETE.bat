@echo off
echo ========================================
echo Evangelism App - Digital Ocean Deployment
echo ========================================
echo.

echo This script will help you deploy to Digital Ocean
echo Make sure you have:
echo 1. A Digital Ocean droplet created
echo 2. SSH access to your droplet
echo 3. Your droplet IP address
echo.

set /p DROPLET_IP="Enter your Digital Ocean droplet IP address: "
set /p SSH_USER="Enter SSH username (usually 'root' or 'ubuntu'): "

echo.
echo ========================================
echo Step 1: Connect to Digital Ocean Droplet
echo ========================================
echo.

echo Connecting to your droplet...
echo Command: ssh %SSH_USER%@%DROPLET_IP%
echo.
echo Once connected, run these commands on your droplet:
echo.

echo ========================================
echo Step 2: Commands to Run on Droplet
echo ========================================
echo.

echo 1. Download and run the deployment script:
echo    curl -o deploy-to-digitalocean.sh https://raw.githubusercontent.com/worldbibleproject/bible/main/deploy-to-digitalocean.sh
echo    chmod +x deploy-to-digitalocean.sh
echo    ./deploy-to-digitalocean.sh
echo.

echo OR manually run these commands:
echo.

echo 2. Update system:
echo    apt update ^&^& apt upgrade -y
echo.

echo 3. Install Docker:
echo    curl -fsSL https://get.docker.com -o get-docker.sh
echo    sh get-docker.sh
echo.

echo 4. Install Docker Compose:
echo    curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
echo    chmod +x /usr/local/bin/docker-compose
echo.

echo 5. Clone repository:
echo    git clone https://github.com/worldbibleproject/bible.git evangelism-app
echo    cd evangelism-app
echo.

echo 6. Create environment file:
echo    cp backend/env.example backend/.env
echo    nano backend/.env
echo.

echo 7. Create production docker-compose:
echo    (copy the docker-compose.prod.yml content)
echo.

echo 8. Start services:
echo    docker-compose -f docker-compose.prod.yml up -d --build
echo.

echo 9. Initialize database:
echo    sleep 30
echo    docker-compose -f docker-compose.prod.yml exec backend npx prisma db push
echo    docker-compose -f docker-compose.prod.yml exec backend npx prisma generate
echo    docker-compose -f docker-compose.prod.yml exec backend npx prisma db seed
echo.

echo ========================================
echo Step 3: Environment Variables to Configure
echo ========================================
echo.

echo Edit backend/.env and set these values:
echo.
echo DATABASE_URL="mysql://evangelism_user:evangelism_password@mysql:3306/evangelism_app"
echo JWT_SECRET="your-super-secret-jwt-secret-change-this-in-production"
echo OPENAI_API_KEY="sk-proj-your-openai-api-key-here"
echo ZOOM_API_KEY="your-zoom-api-key"
echo ZOOM_API_SECRET="your-zoom-api-secret"
echo EMAIL_HOST="smtp.gmail.com"
echo EMAIL_PORT=587
echo EMAIL_USER="your-email@gmail.com"
echo EMAIL_PASS="your-app-password"
echo NODE_ENV="production"
echo PORT=5000
echo FRONTEND_URL="http://%DROPLET_IP%:3000"
echo.

echo ========================================
echo Step 4: Access Your Application
echo ========================================
echo.

echo Once deployed, your app will be available at:
echo 🌐 Frontend: http://%DROPLET_IP%
echo 🔧 Backend API: http://%DROPLET_IP%/api
echo ❤️ Health Check: http://%DROPLET_IP%/health
echo.

echo Default Login Credentials:
echo 👨‍💼 Admin: admin@evangelismapp.com / admin123
echo 🧑‍🏫 Mentor: mentor1@example.com / mentor123
echo 👤 Seeker: seeker1@example.com / seeker123
echo.

echo ========================================
echo Step 5: Useful Commands
echo ========================================
echo.

echo On your droplet, you can use these commands:
echo.
echo View logs:
echo docker-compose -f docker-compose.prod.yml logs -f
echo.
echo Restart services:
echo docker-compose -f docker-compose.prod.yml restart
echo.
echo Check status:
echo docker-compose -f docker-compose.prod.yml ps
echo.
echo Access container:
echo docker-compose -f docker-compose.prod.yml exec backend bash
echo.

echo ========================================
echo Ready to Connect!
echo ========================================
echo.

echo Now connect to your droplet:
echo ssh %SSH_USER%@%DROPLET_IP%
echo.

echo Then run the deployment script or follow the manual steps above.
echo.

pause
