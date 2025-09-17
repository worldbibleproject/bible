# ⚙️ **COMPLETE CONFIGURATION GUIDE**

## 🎯 **OVERVIEW**

This guide walks you through configuring every aspect of the Evangelism App to ensure it runs perfectly on your Windows machine.

---

## 📋 **PREREQUISITES CHECKLIST**

### **Required Software**
- [ ] **Node.js 18+** - [Download here](https://nodejs.org/en/download/)
- [ ] **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- [ ] **Git** - [Download here](https://git-scm.com/download/win)
- [ ] **Visual Studio Code** (Recommended) - [Download here](https://code.visualstudio.com/)

### **System Requirements**
- Windows 10/11 (64-bit)
- 8GB RAM minimum (16GB recommended)
- 20GB free disk space
- Internet connection for API calls

---

## 🔧 **STEP-BY-STEP CONFIGURATION**

### **Step 1: Install Prerequisites**

#### **1.1 Install Node.js**
1. Download Node.js 18+ from [nodejs.org](https://nodejs.org/)
2. Run the installer as Administrator
3. Check "Add to PATH" during installation
4. Verify installation:
   ```cmd
   node --version
   npm --version
   ```

#### **1.2 Install Docker Desktop**
1. Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Run the installer as Administrator
3. Restart your computer when prompted
4. Start Docker Desktop
5. Verify installation:
   ```cmd
   docker --version
   docker-compose --version
   ```

#### **1.3 Install Git**
1. Download Git from [git-scm.com](https://git-scm.com/download/win)
2. Run the installer with default settings
3. Verify installation:
   ```cmd
   git --version
   ```

### **Step 2: Clone and Setup Project**

#### **2.1 Clone Repository**
```cmd
# Open Command Prompt or PowerShell as Administrator
cd C:\
git clone <your-repository-url> evangelism-app
cd evangelism-app
```

#### **2.2 Run Setup Script**
```cmd
# Run the automated setup script
setup-windows.bat
```

**OR** manually follow the steps below:

### **Step 3: Environment Configuration**

#### **3.1 Backend Configuration (backend\.env)**
```env
# Database Configuration
DATABASE_URL="mysql://evangelism_user:evangelism_password@mysql:3306/evangelism_app"
MYSQL_ROOT_PASSWORD="rootpassword123"
MYSQL_DATABASE="evangelism_app"
MYSQL_USER="evangelism_user"
MYSQL_PASSWORD="evangelism_password123"

# JWT Security (CHANGE THESE IN PRODUCTION!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-12345"
JWT_EXPIRES_IN="7d"

# OpenAI API (REQUIRED - Get from https://platform.openai.com/)
OPENAI_API_KEY="sk-proj-your-openai-api-key-here"

# Email Configuration (Gmail example)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"  # Use App Password, not regular password

# Application Settings
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"

# File Upload
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### **3.2 Frontend Configuration (frontend\.env.local)**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="ws://localhost:3001"
```

### **Step 4: API Keys Configuration**

#### **4.1 OpenAI API Key (REQUIRED)**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key and paste it in `backend\.env`:
   ```env
   OPENAI_API_KEY="sk-proj-your-openai-key-here"
   ```

#### **4.2 Gmail App Password (For Email)**
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification (enable if not already)
3. Security → App passwords
4. Generate app password for "Mail"
5. Use this password in `SMTP_PASS` (not your regular Gmail password)

#### **4.3 Video Integration (OPTIONAL)**
Choose one of the following:

**Option A: Zoom (Recommended)**
```env
VIDEO_PLATFORM="zoom"
ZOOM_API_KEY="your-zoom-api-key"
ZOOM_API_SECRET="your-zoom-api-secret"
```

**Option B: Google Meet**
```env
VIDEO_PLATFORM="google_meet"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Option C: Jitsi (Free)**
```env
VIDEO_PLATFORM="jitsi"
JITSI_DOMAIN="meet.jit.si"
```

### **Step 5: Start the Application**

#### **5.1 Using Docker (Recommended)**
```cmd
# Start all services
docker-compose up -d

# Check if all containers are running
docker-compose ps

# View logs if needed
docker-compose logs -f
```

#### **5.2 Initialize Database**
```cmd
# Run database migrations
docker-compose exec backend npx prisma db push

# Seed the database with sample data
docker-compose exec backend npm run db:seed
```

#### **5.3 Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

### **Step 6: Test the Application**

#### **6.1 Test the Wizard**
1. Go to http://localhost:3000
2. Click "Start Your Journey"
3. Fill out the wizard questions
4. Verify AI-generated content appears

#### **6.2 Test User Registration**
1. Click "Get Started" or "Sign In"
2. Create a new account
3. Verify you can log in

#### **6.3 Test Admin Functions**
1. Log in with: `admin@evangelismapp.com` / `admin123`
2. Go to admin dashboard
3. Test user management features

---

## 🔍 **TROUBLESHOOTING**

### **Common Issues**

#### **Docker Issues**
```cmd
# If Docker containers won't start
docker-compose down
docker-compose up -d --force-recreate

# If database connection fails
docker-compose exec mysql mysql -u root -p
# Enter password: rootpassword123
# CREATE DATABASE evangelism_app;
```

#### **Node.js Issues**
```cmd
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rmdir /s node_modules
npm install
```

#### **Database Issues**
```cmd
# Reset database
docker-compose exec backend npx prisma db push --force-reset
docker-compose exec backend npm run db:seed
```

#### **OpenAI API Issues**
- Verify API key is correct
- Check API quota and billing
- Ensure key has proper permissions

### **Debug Mode**
```cmd
# Enable debug logging
set DEBUG=*
npm run dev
```

---

## 📊 **MONITORING & MAINTENANCE**

### **Health Checks**
- Backend: http://localhost:3001/health
- Frontend: http://localhost:3000 (should load)

### **Logs**
```cmd
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### **Database Access**
```cmd
# Access MySQL
docker-compose exec mysql mysql -u root -p evangelism_app
```

---

## 🔐 **SECURITY CHECKLIST**

### **Before Production**
- [ ] Change all default passwords
- [ ] Set strong JWT secret
- [ ] Configure proper SMTP settings
- [ ] Set up SSL certificates
- [ ] Configure firewall rules
- [ ] Enable database backups
- [ ] Set up monitoring

### **Environment Variables to Change**
- `JWT_SECRET` - Use a strong, random secret
- `MYSQL_ROOT_PASSWORD` - Use a strong password
- `MYSQL_PASSWORD` - Use a strong password
- `OPENAI_API_KEY` - Your actual OpenAI key
- `SMTP_USER` and `SMTP_PASS` - Your email credentials

---

## 🎉 **SUCCESS!**

If everything is working correctly, you should see:
- ✅ Frontend loads at http://localhost:3000
- ✅ Backend API responds at http://localhost:3001/health
- ✅ Wizard generates AI content
- ✅ User registration works
- ✅ Admin dashboard accessible

---

## 📞 **SUPPORT**

If you encounter issues:
1. Check this troubleshooting guide
2. Review Docker logs: `docker-compose logs -f`
3. Verify all environment variables are set
4. Ensure all required APIs are configured

---

**Your Evangelism App is now configured and ready to transform lives!** 🎉🙏



