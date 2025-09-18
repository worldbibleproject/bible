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
echo Step 1: Prepare Local Files
echo ========================================
echo.

echo Creating production configuration...
echo.

REM Create production docker-compose file
echo Creating docker-compose.prod.yml...
(
echo version: '3.8'
echo.
echo services:
echo   mysql:
echo     image: mysql:8.0
echo     container_name: evangelism-mysql-prod
echo     restart: unless-stopped
echo     environment:
echo       MYSQL_ROOT_PASSWORD: rootpassword
echo       MYSQL_DATABASE: evangelism_app
echo       MYSQL_USER: evangelism_user
echo       MYSQL_PASSWORD: evangelism_password
echo     volumes:
echo       - mysql_data:/var/lib/mysql
echo     networks:
echo       - evangelism-network
echo.
echo   backend:
echo     build: ./backend
echo     container_name: evangelism-backend-prod
echo     restart: unless-stopped
echo     environment:
echo       NODE_ENV: production
echo       PORT: 5000
echo       DATABASE_URL: mysql://evangelism_user:evangelism_password@mysql:3306/evangelism_app
echo       JWT_SECRET: your-super-secret-jwt-secret-change-this
echo       OPENAI_API_KEY: sk-proj-your-openai-api-key-here
echo       ZOOM_API_KEY: your-zoom-api-key
echo       ZOOM_API_SECRET: your-zoom-api-secret
echo       EMAIL_HOST: smtp.gmail.com
echo       EMAIL_PORT: 587
echo       EMAIL_USER: your-email@gmail.com
echo       EMAIL_PASS: your-app-password
echo     ports:
echo       - "5000:5000"
echo     volumes:
echo       - ./backend:/app
echo       - /app/node_modules
echo     depends_on:
echo       - mysql
echo     networks:
echo       - evangelism-network
echo.
echo   frontend:
echo     build: ./frontend
echo     container_name: evangelism-frontend-prod
echo     restart: unless-stopped
echo     environment:
echo       NEXT_PUBLIC_API_URL: http://%DROPLET_IP%:5000/api
echo     ports:
echo       - "3000:3000"
echo     volumes:
echo       - ./frontend:/app
echo       - /app/node_modules
echo       - /app/.next
echo     depends_on:
echo       - backend
echo     networks:
echo       - evangelism-network
echo.
echo   nginx:
echo     image: nginx:alpine
echo     container_name: evangelism-nginx-prod
echo     restart: unless-stopped
echo     ports:
echo       - "80:80"
echo       - "443:443"
echo     volumes:
echo       - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf
echo       - ./ssl:/etc/nginx/ssl
echo     depends_on:
echo       - frontend
echo       - backend
echo     networks:
echo       - evangelism-network
echo.
echo volumes:
echo   mysql_data:
echo.
echo networks:
echo   evangelism-network:
echo     driver: bridge
) > docker-compose.prod.yml

REM Create nginx directory and config
if not exist "nginx" mkdir nginx

echo Creating nginx production config...
(
echo events {
echo     worker_connections 1024;
echo }
echo.
echo http {
echo     upstream frontend {
echo         server frontend:3000;
echo     }
echo.
echo     upstream backend {
echo         server backend:5000;
echo     }
echo.
echo     server {
echo         listen 80;
echo         server_name %DROPLET_IP%;
echo.
echo         location / {
echo             proxy_pass http://frontend;
echo             proxy_set_header Host $host;
echo             proxy_set_header X-Real-IP $remote_addr;
echo             proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
echo             proxy_set_header X-Forwarded-Proto $scheme;
echo         }
echo.
echo         location /api {
echo             proxy_pass http://backend;
echo             proxy_set_header Host $host;
echo             proxy_set_header X-Real-IP $remote_addr;
echo             proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
echo             proxy_set_header X-Forwarded-Proto $scheme;
echo         }
echo     }
echo }
) > nginx\nginx.prod.conf

echo.
echo ========================================
echo Step 2: Deploy to Digital Ocean
echo ========================================
echo.

echo Creating deployment script for the server...
(
echo #!/bin/bash
echo echo "Setting up Evangelism App on Digital Ocean..."
echo.
echo # Update system
echo apt update && apt upgrade -y
echo.
echo # Install Docker
echo curl -fsSL https://get.docker.com -o get-docker.sh
echo sh get-docker.sh
echo usermod -aG docker $USER
echo.
echo # Install Docker Compose
echo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
echo chmod +x /usr/local/bin/docker-compose
echo.
echo # Create app directory
echo mkdir -p /opt/evangelism-app
echo cd /opt/evangelism-app
echo.
echo # Clone repository
echo git clone https://github.com/your-username/evangelism-app.git .
echo.
echo # Set up environment
echo cp backend/env.example backend/.env
echo.
echo # Start services
echo docker-compose -f docker-compose.prod.yml up -d
echo.
echo # Wait for services
echo sleep 30
echo.
echo # Run database setup
echo docker-compose -f docker-compose.prod.yml exec backend npx prisma db push
echo docker-compose -f docker-compose.prod.yml exec backend npx prisma generate
echo docker-compose -f docker-compose.prod.yml exec backend npx prisma db seed
echo.
echo echo "Deployment complete!"
echo echo "Frontend: http://%DROPLET_IP%:3000"
echo echo "Backend: http://%DROPLET_IP%:5000"
) > deploy-server.sh

echo.
echo ========================================
echo Step 3: Manual Deployment Steps
echo ========================================
echo.
echo 1. Copy the following files to your Digital Ocean droplet:
echo    - All project files
echo    - docker-compose.prod.yml
echo    - nginx/nginx.prod.conf
echo.
echo 2. SSH into your droplet:
echo    ssh %SSH_USER%@%DROPLET_IP%
echo.
echo 3. Run the deployment script:
echo    chmod +x deploy-server.sh
echo    ./deploy-server.sh
echo.
echo 4. Configure your environment variables in backend/.env:
echo    - OPENAI_API_KEY
echo    - ZOOM_API_KEY
echo    - ZOOM_API_SECRET
echo    - EMAIL credentials
echo.
echo 5. Restart the services:
echo    docker-compose -f docker-compose.prod.yml restart
echo.
echo ========================================
echo Deployment Files Created
echo ========================================
echo.
echo ✅ docker-compose.prod.yml
echo ✅ nginx/nginx.prod.conf
echo ✅ deploy-server.sh
echo.
echo Next steps:
echo 1. Upload these files to your Digital Ocean droplet
echo 2. Run the deployment script
echo 3. Configure environment variables
echo 4. Access your app at http://%DROPLET_IP%
echo.
pause
