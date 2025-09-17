# 🚀 Production Deployment Guide - Evangelism App

## 📋 Overview

This guide covers deploying the Evangelism App to production environments, including cloud platforms, VPS, and dedicated servers.

## 🌐 Hosting Options

### Recommended Platforms
1. **DigitalOcean** - $20-40/month (Recommended)
2. **AWS EC2** - $25-50/month
3. **Google Cloud Platform** - $20-45/month
4. **Azure** - $25-50/month
5. **Vultr** - $20-40/month
6. **Linode** - $20-40/month

### Minimum Server Requirements
- **CPU**: 2 cores
- **RAM**: 4GB (8GB recommended)
- **Storage**: 50GB SSD
- **Bandwidth**: 1TB/month
- **OS**: Ubuntu 20.04+ or CentOS 8+

## 🔧 Server Setup

### Step 1: Server Preparation

#### 1.1 Update System
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

#### 1.2 Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

#### 1.3 Install Additional Tools
```bash
# Install Git, Node.js (for building)
sudo apt install git nodejs npm -y

# Install Nginx (for reverse proxy)
sudo apt install nginx -y

# Install Certbot (for SSL)
sudo apt install certbot python3-certbot-nginx -y
```

### Step 2: Application Deployment

#### 2.1 Clone Repository
```bash
# Clone your repository
git clone <your-repository-url> /opt/evangelism-app
cd /opt/evangelism-app
```

#### 2.2 Configure Environment
```bash
# Copy environment files
cp backend/env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit production environment
nano backend/.env
```

#### 2.3 Production Environment Variables
```env
# Database (Use managed database in production)
DATABASE_URL="mysql://username:password@your-db-host:3306/evangelism_app"

# Security (CHANGE THESE!)
JWT_SECRET="your-super-secure-jwt-secret-256-bits-minimum"
JWT_EXPIRES_IN="7d"

# OpenAI
OPENAI_API_KEY="sk-proj-your-openai-api-key"

# Email (Use professional email service)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"

# Application
NODE_ENV="production"
PORT=3001
FRONTEND_URL="https://yourdomain.com"

# File Upload
UPLOAD_PATH="/app/uploads"
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### 2.4 Frontend Environment
```env
NEXT_PUBLIC_API_URL="https://yourdomain.com/api"
NEXT_PUBLIC_WS_URL="wss://yourdomain.com"
```

### Step 3: Database Setup

#### Option A: Managed Database (Recommended)
- **AWS RDS** - MySQL 8.0
- **Google Cloud SQL** - MySQL 8.0
- **DigitalOcean Managed Database** - MySQL 8.0
- **PlanetScale** - MySQL-compatible

#### Option B: Self-Hosted Database
```bash
# Update docker-compose.yml to use external database
# Remove mysql service and update DATABASE_URL
```

### Step 4: SSL Certificate

#### 4.1 Get SSL Certificate
```bash
# Stop Nginx temporarily
sudo systemctl stop nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Start Nginx
sudo systemctl start nginx
```

#### 4.2 Configure Nginx
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/evangelism-app
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
```

#### 4.3 Enable Site
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/evangelism-app /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 5: Deploy Application

#### 5.1 Build and Start
```bash
# Build and start application
docker-compose up -d --build

# Initialize database
docker-compose exec backend npx prisma db push
docker-compose exec backend npm run db:seed
```

#### 5.2 Set Up Auto-Start
```bash
# Create systemd service
sudo nano /etc/systemd/system/evangelism-app.service
```

```ini
[Unit]
Description=Evangelism App
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/evangelism-app
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
# Enable service
sudo systemctl enable evangelism-app.service
sudo systemctl start evangelism-app.service
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/evangelism-app
            git pull origin main
            docker-compose down
            docker-compose up -d --build
            docker-compose exec backend npx prisma db push
```

## 📊 Monitoring & Maintenance

### 1. Health Monitoring
```bash
# Create health check script
sudo nano /opt/evangelism-app/health-check.sh
```

```bash
#!/bin/bash
# Health check script

# Check if containers are running
if ! docker-compose ps | grep -q "Up"; then
    echo "Containers not running, restarting..."
    docker-compose up -d
fi

# Check API health
if ! curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "API not responding, restarting backend..."
    docker-compose restart backend
fi

# Check frontend
if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "Frontend not responding, restarting..."
    docker-compose restart frontend
fi
```

```bash
# Make executable
chmod +x /opt/evangelism-app/health-check.sh

# Add to crontab (run every 5 minutes)
crontab -e
# Add: */5 * * * * /opt/evangelism-app/health-check.sh
```

### 2. Log Management
```bash
# Set up log rotation
sudo nano /etc/logrotate.d/evangelism-app
```

```
/opt/evangelism-app/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 root root
}
```

### 3. Database Backups
```bash
# Create backup script
sudo nano /opt/evangelism-app/backup.sh
```

```bash
#!/bin/bash
# Database backup script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/evangelism-app/backups"
DB_NAME="evangelism_app"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
docker-compose exec -T mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

```bash
# Make executable
chmod +x /opt/evangelism-app/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /opt/evangelism-app/backup.sh
```

## 🔐 Security Hardening

### 1. Firewall Configuration
```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Docker Security
```bash
# Run containers as non-root user
# Update docker-compose.yml with user: "1000:1000"

# Use secrets for sensitive data
docker secret create jwt_secret /path/to/jwt_secret.txt
```

### 3. Database Security
- Use strong passwords
- Enable SSL connections
- Restrict database access to application server only
- Regular security updates

## 📈 Performance Optimization

### 1. Nginx Caching
```nginx
# Add to Nginx configuration
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    proxy_pass http://localhost:3000;
}
```

### 2. Database Optimization
- Enable query caching
- Add proper indexes
- Regular maintenance and optimization

### 3. CDN Integration
- Use CloudFlare or AWS CloudFront
- Cache static assets
- Enable compression

## 🚨 Disaster Recovery

### 1. Backup Strategy
- Daily database backups
- Weekly full system backups
- Off-site backup storage

### 2. Recovery Procedures
```bash
# Restore database
gunzip backup_20241201_020000.sql.gz
docker-compose exec -T mysql mysql -u root -p$MYSQL_ROOT_PASSWORD $DB_NAME < backup_20241201_020000.sql

# Restore application
git clone <repository-url> /opt/evangelism-app
docker-compose up -d --build
```

## 📞 Support & Maintenance

### Regular Tasks
- [ ] Monitor server resources
- [ ] Check application logs
- [ ] Update dependencies
- [ ] Backup verification
- [ ] Security updates
- [ ] Performance monitoring

### Monitoring Tools
- **Uptime monitoring**: UptimeRobot, Pingdom
- **Server monitoring**: New Relic, DataDog
- **Log management**: ELK Stack, Fluentd
- **Error tracking**: Sentry, Bugsnag

---

**Your Evangelism App is now production-ready!** 🚀🙏



