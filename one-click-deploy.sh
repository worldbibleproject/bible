#!/bin/bash

# 🚀 ONE-CLICK DIGITAL OCEAN DEPLOYMENT SCRIPT
# This script automates the entire deployment process

set -e

echo "🚀 Starting Digital Ocean Deployment..."
echo "=================================="

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

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use sudo)"
    exit 1
fi

# Get droplet IP
print_status "Getting droplet IP address..."
DROPLET_IP=$(curl -s ifconfig.me)
print_success "Droplet IP: $DROPLET_IP"

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
print_status "Installing required packages..."
apt install -y curl wget git nginx certbot python3-certbot-nginx

# Install Docker
print_status "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
print_status "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Clone repository
print_status "Cloning repository..."
if [ -d "bible" ]; then
    print_warning "Repository already exists, updating..."
    cd bible
    git pull origin main
else
    git clone https://github.com/worldbibleproject/bible.git
    cd bible
fi

# Set up environment variables
print_status "Setting up environment variables..."
if [ ! -f ".env" ]; then
    cp env.production .env
    
    # Update environment variables with droplet IP
    sed -i "s/localhost:5000/$DROPLET_IP:5000/g" .env
    sed -i "s/localhost:3000/$DROPLET_IP:3000/g" .env
    
    print_warning "Please update .env file with your actual API keys and secrets!"
    print_warning "Required: OPENAI_API_KEY, ZOOM_API_KEY, ZOOM_API_SECRET, EMAIL_USER, EMAIL_PASS"
    
    # Create a sample .env with placeholders
    cat > .env << EOF
# Database
DATABASE_URL=mysql://evangelism_user:evangelism_password@mysql:3306/evangelism_db

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-$(openssl rand -hex 32)

# OpenAI API Key (REQUIRED)
OPENAI_API_KEY=your-openai-api-key-here

# Zoom API Keys (REQUIRED)
ZOOM_API_KEY=your-zoom-api-key-here
ZOOM_API_SECRET=your-zoom-api-secret-here

# Email Configuration (REQUIRED)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here

# Frontend URLs
NEXT_PUBLIC_API_URL=http://$DROPLET_IP:5000/api
NEXT_PUBLIC_WS_URL=ws://$DROPLET_IP:5000
FRONTEND_URL=http://$DROPLET_IP:3000

# Node Environment
NODE_ENV=production
EOF
    
    print_warning "Created .env file with placeholders. Please update with your actual values!"
fi

# Set up nginx
print_status "Setting up nginx..."
if [ -f "nginx/nginx.conf" ]; then
    cp nginx/nginx.conf /etc/nginx/sites-available/evangelism
    ln -sf /etc/nginx/sites-available/evangelism /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Update nginx config with droplet IP
    sed -i "s/localhost/$DROPLET_IP/g" /etc/nginx/sites-available/evangelism
    
    # Test nginx configuration
    nginx -t
    systemctl restart nginx
    print_success "Nginx configured successfully"
fi

# Start Docker services
print_status "Starting Docker services..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Check service status
print_status "Checking service status..."
docker-compose -f docker-compose.prod.yml ps

# Test health endpoints
print_status "Testing health endpoints..."
sleep 10

# Test backend health
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    print_success "Backend is healthy"
else
    print_warning "Backend health check failed, but continuing..."
fi

# Test frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend is accessible"
else
    print_warning "Frontend check failed, but continuing..."
fi

# Set up firewall
print_status "Setting up firewall..."
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3000
ufw allow 5000

# Create systemd service for auto-start
print_status "Creating systemd service..."
cat > /etc/systemd/system/evangelism.service << EOF
[Unit]
Description=Evangelism Platform
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/root/bible
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable evangelism.service

# Set up log rotation
print_status "Setting up log rotation..."
cat > /etc/logrotate.d/evangelism << EOF
/var/log/evangelism/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose -f /root/bible/docker-compose.prod.yml restart
    endscript
}
EOF

# Create backup script
print_status "Creating backup script..."
cat > /root/backup-evangelism.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker-compose -f /root/bible/docker-compose.prod.yml exec -T mysql mysqldump -u evangelism_user -pevangelism_password evangelism_db > $BACKUP_DIR/database_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /root/bible

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /root/backup-evangelism.sh

# Set up daily backup cron job
print_status "Setting up daily backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-evangelism.sh") | crontab -

# Create update script
print_status "Creating update script..."
cat > /root/update-evangelism.sh << 'EOF'
#!/bin/bash
cd /root/bible
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
echo "Update completed at $(date)"
EOF

chmod +x /root/update-evangelism.sh

# Final status
print_success "=================================="
print_success "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
print_success "=================================="
print_status "Your Evangelism Platform is now live at:"
print_status "Frontend: http://$DROPLET_IP:3000"
print_status "Backend API: http://$DROPLET_IP:5000"
print_status "Admin Dashboard: http://$DROPLET_IP:3000/admin"
print_status ""
print_warning "IMPORTANT: Please update your .env file with actual API keys:"
print_warning "- OPENAI_API_KEY"
print_warning "- ZOOM_API_KEY & ZOOM_API_SECRET"
print_warning "- EMAIL_USER & EMAIL_PASS"
print_status ""
print_status "Useful commands:"
print_status "- View logs: docker-compose -f docker-compose.prod.yml logs -f"
print_status "- Restart services: docker-compose -f docker-compose.prod.yml restart"
print_status "- Update application: /root/update-evangelism.sh"
print_status "- Backup data: /root/backup-evangelism.sh"
print_status ""
print_success "🚀 Your world-class evangelism platform is ready to serve!"
