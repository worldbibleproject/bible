# 🚀 **EASY DIGITAL OCEAN DEPLOYMENT GUIDE**

## **Option 1: One-Click Deploy (Easiest)**

### **Step 1: Create Digital Ocean Droplet**
1. Go to [Digital Ocean](https://cloud.digitalocean.com/)
2. Click "Create" → "Droplets"
3. Choose:
   - **Image**: Ubuntu 22.04 LTS
   - **Size**: Basic Plan, $12/month (2GB RAM, 1 CPU, 50GB SSD)
   - **Authentication**: SSH Key (recommended) or Password
   - **Hostname**: evangelism-platform

### **Step 2: Connect to Your Droplet**
```bash
# Replace YOUR_DROPLET_IP with your actual IP
ssh root@YOUR_DROPLET_IP
```

### **Step 3: Run the Automated Setup Script**
```bash
# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/worldbibleproject/bible/main/deploy-to-digitalocean.sh | bash
```

**That's it!** The script will:
- Install Docker and Docker Compose
- Clone your repository
- Set up environment variables
- Start all services
- Configure nginx
- Set up SSL certificates

## **Option 2: Manual Setup (More Control)**

### **Step 1: Install Dependencies**
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Git
apt install git -y
```

### **Step 2: Clone Repository**
```bash
git clone https://github.com/worldbibleproject/bible.git
cd bible
```

### **Step 3: Set Up Environment**
```bash
# Copy environment file
cp env.production .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**
```env
# Database
DATABASE_URL=mysql://evangelism_user:evangelism_password@mysql:3306/evangelism_db

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI API Key
OPENAI_API_KEY=your-openai-api-key

# Zoom API Keys
ZOOM_API_KEY=your-zoom-api-key
ZOOM_API_SECRET=your-zoom-api-secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URLs (replace with your droplet IP)
NEXT_PUBLIC_API_URL=http://YOUR_DROPLET_IP:5000/api
NEXT_PUBLIC_WS_URL=ws://YOUR_DROPLET_IP:5000
FRONTEND_URL=http://YOUR_DROPLET_IP:3000
```

### **Step 4: Start Services**
```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### **Step 5: Set Up Domain (Optional)**
```bash
# Install nginx
apt install nginx -y

# Copy nginx configuration
cp nginx/nginx.conf /etc/nginx/sites-available/evangelism
ln -s /etc/nginx/sites-available/evangelism /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Restart nginx
systemctl restart nginx
```

## **Option 3: Using Digital Ocean App Platform (No Server Management)**

### **Step 1: Create App**
1. Go to Digital Ocean App Platform
2. Click "Create App"
3. Connect your GitHub repository: `worldbibleproject/bible`

### **Step 2: Configure Services**
**Backend Service:**
- Source: `/backend`
- Build Command: `npm install && npm run build`
- Run Command: `npm start`
- Port: 5000

**Frontend Service:**
- Source: `/frontend`
- Build Command: `npm install && npm run build`
- Run Command: `npm start`
- Port: 3000

**Database:**
- Add MySQL database
- Plan: Basic ($15/month)

### **Step 3: Set Environment Variables**
Add all the environment variables from the manual setup.

### **Step 4: Deploy**
Click "Deploy" and wait for the build to complete.

## **Post-Deployment Setup**

### **1. Seed Database**
```bash
# Connect to backend container
docker-compose -f docker-compose.prod.yml exec backend bash

# Run database seed
npm run db:seed
```

### **2. Create Admin User**
```bash
# Connect to backend container
docker-compose -f docker-compose.prod.yml exec backend bash

# Create admin user (you'll need to implement this)
node scripts/create-admin.js
```

### **3. Set Up SSL (Recommended)**
```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d yourdomain.com

# Auto-renewal
crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## **Monitoring & Maintenance**

### **Health Checks**
```bash
# Check all services
curl http://YOUR_DROPLET_IP:5000/health
curl http://YOUR_DROPLET_IP:3000

# Check database
docker-compose -f docker-compose.prod.yml exec mysql mysql -u evangelism_user -p evangelism_db
```

### **Backup Database**
```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec mysql mysqldump -u evangelism_user -p evangelism_db > backup.sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T mysql mysql -u evangelism_user -p evangelism_db < backup.sql
```

### **Update Application**
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

## **Troubleshooting**

### **Common Issues**

**1. Services Won't Start**
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check disk space
df -h

# Check memory
free -h
```

**2. Database Connection Issues**
```bash
# Check database status
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p -e "SHOW DATABASES;"

# Reset database
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

**3. Port Conflicts**
```bash
# Check what's using ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000
netstat -tulpn | grep :3306
```

## **Cost Estimation**

### **Digital Ocean Droplet**
- **Basic Plan**: $12/month (2GB RAM, 1 CPU, 50GB SSD)
- **Standard Plan**: $24/month (4GB RAM, 2 CPU, 80GB SSD) - Recommended for production
- **CPU-Optimized**: $42/month (4GB RAM, 2 CPU, 25GB SSD) - For high performance

### **Additional Costs**
- **Domain**: $10-15/year
- **SSL Certificate**: Free with Let's Encrypt
- **Backup Storage**: $5/month for 100GB

### **Total Monthly Cost**
- **Development**: ~$12/month
- **Production**: ~$30-50/month (including domain and backups)

## **Security Recommendations**

### **1. Firewall Setup**
```bash
# Enable UFW
ufw enable

# Allow SSH
ufw allow ssh

# Allow HTTP/HTTPS
ufw allow 80
ufw allow 443

# Allow application ports (only if needed)
ufw allow 3000
ufw allow 5000
```

### **2. SSH Security**
```bash
# Disable root login
nano /etc/ssh/sshd_config
# Set: PermitRootLogin no

# Restart SSH
systemctl restart ssh
```

### **3. Regular Updates**
```bash
# Set up automatic updates
apt install unattended-upgrades -y
dpkg-reconfigure unattended-upgrades
```

## **🎉 You're Ready to Launch!**

Your world-class evangelism platform is now ready for production deployment. Choose the deployment method that works best for you:

1. **One-Click Deploy**: Fastest and easiest
2. **Manual Setup**: More control and learning
3. **App Platform**: No server management needed

The platform will be accessible at:
- **Frontend**: http://YOUR_DROPLET_IP:3000
- **Backend API**: http://YOUR_DROPLET_IP:5000
- **Admin Dashboard**: http://YOUR_DROPLET_IP:3000/admin

**Your evangelism platform is now live and ready to serve seekers, mentors, church finders, and administrators!** 🚀
