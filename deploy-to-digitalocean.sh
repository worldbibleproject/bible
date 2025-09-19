#!/bin/bash

# Evangelism App Digital Ocean Deployment Script
# This script deploys the complete application to Digital Ocean

set -e

echo "🚀 Starting Evangelism App deployment on Digital Ocean..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Detect droplet IP
DROPLET_IP=$(curl -s http://169.254.169.254/metadata/v1/interfaces/public/0/ipv4/address 2>/dev/null || echo "137.184.187.189")
print_status "Detected droplet IP: $DROPLET_IP"

# Update system packages
print_status "Updating system packages..."
apt-get update -y
apt-get upgrade -y

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker root
    systemctl enable docker
    systemctl start docker
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Install Nginx if not present
if ! command -v nginx &> /dev/null; then
    print_status "Installing Nginx..."
    apt-get install -y nginx
    systemctl enable nginx
fi

# Install Certbot for SSL
if ! command -v certbot &> /dev/null; then
    print_status "Installing Certbot for SSL..."
    apt-get install -y certbot python3-certbot-nginx
fi

# Create application directory
APP_DIR="/root/evangelism-app"
print_status "Creating application directory: $APP_DIR"
mkdir -p $APP_DIR
cd $APP_DIR

# Stop any existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Pull latest code from GitHub
print_status "Pulling latest code from GitHub..."
if [ -d ".git" ]; then
    git pull origin main
else
    git clone https://github.com/worldbibleproject/bible.git .
fi

# Set up environment variables
print_status "Setting up environment variables..."
if [ ! -f ".env" ]; then
    cp env.production .env
    # Update environment variables for production
    sed -i "s/localhost:5000/$DROPLET_IP/g" .env
    sed -i "s/localhost:3000/$DROPLET_IP/g" .env
    print_warning "Please update .env file with your actual API keys and secrets!"
fi

# Build and start services
print_status "Building and starting services..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check service health
print_status "Checking service health..."
docker-compose -f docker-compose.prod.yml ps

# Test API endpoints
print_status "Testing API endpoints..."
if curl -f http://localhost:5000/health; then
    print_status "Backend health check passed"
else
    print_error "Backend health check failed"
fi

if curl -f http://localhost:3000; then
    print_status "Frontend health check passed"
else
    print_error "Frontend health check failed"
fi

# Set up Nginx reverse proxy
print_status "Setting up Nginx reverse proxy..."
cat > /etc/nginx/sites-available/evangelism-app << EOF
server {
    listen 80;
    server_name $DROPLET_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /health {
        proxy_pass http://localhost:5000/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/evangelism-app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t && systemctl reload nginx

# Set up SSL (optional - requires domain name)
print_status "SSL setup (optional - requires domain name)"
print_warning "To set up SSL, run: certbot --nginx -d yourdomain.com"

# Create systemd service for auto-start
print_status "Creating systemd service for auto-start..."
cat > /etc/systemd/system/evangelism-app.service << EOF
[Unit]
Description=Evangelism App
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl enable evangelism-app.service

# Final status check
print_status "Final deployment status:"
echo "✅ Application URL: http://$DROPLET_IP"
echo "✅ API URL: http://$DROPLET_IP/api"
echo "✅ Health Check: http://$DROPLET_IP/health"
echo ""
echo "📋 Next steps:"
echo "1. Update .env file with your actual API keys"
echo "2. Set up SSL with: certbot --nginx -d yourdomain.com"
echo "3. Configure your domain DNS to point to $DROPLET_IP"
echo ""
echo "🔧 Management commands:"
echo "- View logs: docker-compose -f docker-compose.prod.yml logs"
echo "- Restart: docker-compose -f docker-compose.prod.yml restart"
echo "- Update: git pull && docker-compose -f docker-compose.prod.yml up -d --build"

print_status "Deployment completed successfully! 🎉"

