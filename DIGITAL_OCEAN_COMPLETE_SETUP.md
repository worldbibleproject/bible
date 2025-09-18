# 🚀 Digital Ocean Complete Setup Guide

## Step-by-Step Deployment Instructions

### 1. Create Digital Ocean Droplet

1. **Go to Digital Ocean Console**: https://cloud.digitalocean.com/
2. **Click "Create" → "Droplets"**
3. **Choose Configuration**:
   - **Image**: Ubuntu 22.04 (LTS) x64
   - **Plan**: Basic ($12/month - 2GB RAM, 1 CPU, 50GB SSD)
   - **Authentication**: SSH Key (recommended) or Password
   - **Hostname**: evangelism-app-prod
   - **Region**: Choose closest to your users

4. **Click "Create Droplet"**

### 2. SSH Key Setup (Recommended)

If you don't have an SSH key:
```bash
# On your local machine (Windows):
ssh-keygen -t ed25519 -C "your-email@example.com"
# Press Enter for default location
# Enter a passphrase (optional)
```

Add your public key to Digital Ocean:
1. Copy your public key: `type %USERPROFILE%\.ssh\id_ed25519.pub`
2. In Digital Ocean: Settings → Security → SSH Keys → Add SSH Key
3. Paste your public key and give it a name

### 3. Connect to Your Droplet

```bash
# Replace YOUR_DROPLET_IP with actual IP
ssh root@YOUR_DROPLET_IP
```

### 4. Initial Server Setup

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

### 5. Clone Your Repository

```bash
# Clone the repository
git clone https://github.com/worldbibleproject/bible.git evangelism-app
cd evangelism-app

# Verify files are there
ls -la
```

### 6. Configure Environment Variables

```bash
# Copy environment template
cp backend/env.example backend/.env

# Edit the environment file
nano backend/.env
```

**Required Environment Variables:**
```bash
# Database
DATABASE_URL="mysql://evangelism_user:evangelism_password@mysql:3306/evangelism_app"

# JWT (CHANGE THIS!)
JWT_SECRET="your-super-secure-jwt-secret-change-this-in-production"

# OpenAI API
OPENAI_API_KEY="sk-proj-your-openai-api-key-here"

# Zoom API
ZOOM_API_KEY="your-zoom-api-key"
ZOOM_API_SECRET="your-zoom-api-secret"

# Email Service
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# App Configuration
NODE_ENV="production"
PORT=5000
FRONTEND_URL="http://YOUR_DROPLET_IP:3000"
```

### 7. Create Production Docker Compose

```bash
# Create production docker-compose file
cat > docker-compose.prod.yml << 'EOF'
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
      NEXT_PUBLIC_API_URL: http://YOUR_DROPLET_IP:5000/api
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
```

### 8. Create Nginx Configuration

```bash
# Create nginx directory
mkdir -p nginx

# Create nginx configuration
cat > nginx/nginx.prod.conf << 'EOF'
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
        server_name YOUR_DROPLET_IP;

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF
```

### 9. Start the Application

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# Check if services are running
docker-compose -f docker-compose.prod.yml ps
```

### 10. Initialize Database

```bash
# Wait for services to start
sleep 30

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma db push

# Generate Prisma client
docker-compose -f docker-compose.prod.yml exec backend npx prisma generate

# Seed database with sample data
docker-compose -f docker-compose.prod.yml exec backend npx prisma db seed
```

### 11. Verify Deployment

```bash
# Check application logs
docker-compose -f docker-compose.prod.yml logs -f

# Test endpoints
curl http://localhost/health
curl http://localhost/api/churches
```

### 12. Access Your Application

- **Frontend**: http://YOUR_DROPLET_IP
- **Backend API**: http://YOUR_DROPLET_IP/api
- **Health Check**: http://YOUR_DROPLET_IP/health

### 13. Default Login Credentials

- **Admin**: admin@evangelismapp.com / admin123
- **Mentor**: mentor1@example.com / mentor123
- **Seeker**: seeker1@example.com / seeker123

---

## 🔧 Troubleshooting Commands

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Access container shell
docker-compose -f docker-compose.prod.yml exec backend bash
docker-compose -f docker-compose.prod.yml exec frontend bash
```

---

## 🔒 Security Considerations

1. **Change default passwords** in production
2. **Use strong JWT secrets**
3. **Configure firewall** (ufw)
4. **Set up SSL certificates** (Let's Encrypt)
5. **Regular backups** of database

---

## 📊 Monitoring

```bash
# Monitor resource usage
docker stats

# Check disk usage
df -h

# Monitor logs
tail -f /var/log/syslog
```

Your Evangelism App will be live and accessible at your droplet's IP address! 🎉
