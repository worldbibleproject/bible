#!/bin/bash

# Evangelism App - Digital Ocean Deployment Script
# Run this script on your Digital Ocean droplet

set -e  # Exit on any error

echo "🚀 Starting Evangelism App deployment on Digital Ocean..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get droplet IP
DROPLET_IP=$(curl -s ifconfig.me)
print_status "Detected droplet IP: $DROPLET_IP"

# Step 1: Update system
print_status "Updating system packages..."
apt update && apt upgrade -y
print_success "System updated"

# Step 2: Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
    print_success "Docker installed"
else
    print_warning "Docker already installed"
fi

# Step 3: Install Docker Compose
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed"
else
    print_warning "Docker Compose already installed"
fi

# Step 4: Clone repository
print_status "Cloning repository..."
if [ ! -d "evangelism-app" ]; then
    git clone https://github.com/worldbibleproject/bible.git evangelism-app
    print_success "Repository cloned"
else
    print_warning "Repository already exists, updating..."
    cd evangelism-app
    git pull origin main
    cd ..
fi

cd evangelism-app

# Step 5: Create environment file
print_status "Creating environment configuration..."
if [ ! -f "backend/.env" ]; then
    cp backend/env.example backend/.env
    print_success "Environment file created"
else
    print_warning "Environment file already exists"
fi

# Step 6: Create production docker-compose
print_status "Creating production Docker Compose configuration..."
cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: evangelism-mysql-prod
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: evangelism_app
      MYSQL_USER: evangelism_user
      MYSQL_PASSWORD: evangelism_password
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - evangelism-network

  backend:
    build: ./backend
    container_name: evangelism-backend-prod
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 5000
      DATABASE_URL: mysql://evangelism_user:evangelism_password@mysql:3306/evangelism_app
      JWT_SECRET: your-super-secret-jwt-secret-change-this-in-production
      OPENAI_API_KEY: sk-proj-your-openai-api-key-here
      ZOOM_API_KEY: your-zoom-api-key
      ZOOM_API_SECRET: your-zoom-api-secret
      EMAIL_HOST: smtp.gmail.com
      EMAIL_PORT: 587
      EMAIL_USER: your-email@gmail.com
      EMAIL_PASS: your-app-password
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - mysql
    networks:
      - evangelism-network

  frontend:
    build: ./frontend
    container_name: evangelism-frontend-prod
    restart: unless-stopped
    environment:
      NEXT_PUBLIC_API_URL: http://$DROPLET_IP:5000/api
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - backend
    networks:
      - evangelism-network

  nginx:
    image: nginx:alpine
    container_name: evangelism-nginx-prod
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend
    networks:
      - evangelism-network

volumes:
  mysql_data:

networks:
  evangelism-network:
    driver: bridge
EOF

# Step 7: Create nginx configuration
print_status "Creating Nginx configuration..."
mkdir -p nginx

cat > nginx/nginx.prod.conf << EOF
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:5000;
    }

    server {
        listen 80;
        server_name $DROPLET_IP;

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        location /api {
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF

# Step 8: Build and start services
print_status "Building and starting services..."
docker-compose -f docker-compose.prod.yml up -d --build

# Step 9: Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Step 10: Check service status
print_status "Checking service status..."
docker-compose -f docker-compose.prod.yml ps

# Step 11: Initialize database
print_status "Initializing database..."
docker-compose -f docker-compose.prod.yml exec backend npx prisma db push
docker-compose -f docker-compose.prod.yml exec backend npx prisma generate
docker-compose -f docker-compose.prod.yml exec backend npx prisma db seed

# Step 12: Test endpoints
print_status "Testing endpoints..."
sleep 10

if curl -f http://localhost/health > /dev/null 2>&1; then
    print_success "Backend health check passed"
else
    print_error "Backend health check failed"
fi

if curl -f http://localhost > /dev/null 2>&1; then
    print_success "Frontend accessibility check passed"
else
    print_error "Frontend accessibility check failed"
fi

# Step 13: Display final information
echo ""
echo "🎉 Deployment Complete!"
echo "=========================="
echo ""
echo "Your Evangelism App is now live at:"
echo "🌐 Frontend: http://$DROPLET_IP"
echo "🔧 Backend API: http://$DROPLET_IP/api"
echo "❤️ Health Check: http://$DROPLET_IP/health"
echo ""
echo "Default Login Credentials:"
echo "👨‍💼 Admin: admin@evangelismapp.com / admin123"
echo "🧑‍🏫 Mentor: mentor1@example.com / mentor123"
echo "👤 Seeker: seeker1@example.com / seeker123"
echo ""
echo "Next Steps:"
echo "1. Configure your API keys in backend/.env"
echo "2. Restart services: docker-compose -f docker-compose.prod.yml restart"
echo "3. Set up SSL certificates (optional)"
echo ""
echo "Useful Commands:"
echo "📊 View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "🔄 Restart: docker-compose -f docker-compose.prod.yml restart"
echo "📈 Status: docker-compose -f docker-compose.prod.yml ps"
echo ""

print_success "Evangelism App deployment completed successfully! 🚀"
