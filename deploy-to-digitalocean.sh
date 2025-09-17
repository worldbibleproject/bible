#!/bin/bash

# 🚀 Digital Ocean Deployment Script
# Run this script on your Digital Ocean droplet

echo "🚀 Starting Evangelism App Deployment..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
echo "🔧 Installing Docker Compose..."
apt install docker-compose -y

# Install Git
echo "📁 Installing Git..."
apt install git -y

# Install Nginx
echo "🌐 Installing Nginx..."
apt install nginx -y

# Install Certbot for SSL
echo "🔒 Installing SSL tools..."
apt install certbot python3-certbot-nginx -y

# Clone repository (replace with your GitHub URL)
echo "📥 Cloning repository..."
git clone https://github.com/YOUR_USERNAME/evangelism-app.git
cd evangelism-app

# Create environment file
echo "⚙️ Setting up environment..."
cp backend/env.example backend/.env

# Create production environment file
cat > backend/.env << EOF
# Database
DATABASE_URL="mysql://root:password@db:3306/evangelism_app"

# JWT
JWT_SECRET="$(openssl rand -base64 32)"

# OpenAI
OPENAI_API_KEY="your-openai-api-key-here"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# App
NODE_ENV="production"
PORT=3001
FRONTEND_URL="https://your-domain.com"

# Zoom (optional)
ZOOM_API_KEY="your-zoom-api-key"
ZOOM_API_SECRET="your-zoom-api-secret"
EOF

# Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/evangelism-app << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/evangelism-app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Start services
echo "🚀 Starting application..."
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check status
echo "📊 Checking service status..."
docker-compose ps

# Configure firewall
echo "🔥 Configuring firewall..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

# Create backup script
echo "💾 Creating backup script..."
cat > /root/backup-db.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
docker-compose exec -T mysql mysqldump -u root -ppassword evangelism_app > /root/backup_\$DATE.sql
find /root/backup_*.sql -mtime +7 -delete
EOF

chmod +x /root/backup-db.sh

# Add backup to crontab
echo "⏰ Setting up daily backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-db.sh") | crontab -

echo "🎉 Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/.env with your API keys"
echo "2. Update your-domain.com in Nginx config"
echo "3. Run: certbot --nginx -d your-domain.com"
echo "4. Restart services: docker-compose restart"
echo ""
echo "🌐 Your app will be available at: http://your-domain.com"
echo "📊 Check logs: docker-compose logs -f"
echo "🔄 Restart: docker-compose restart"
