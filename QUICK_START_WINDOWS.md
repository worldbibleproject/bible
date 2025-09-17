# ⚡ Quick Start - Windows (5 Minutes)

## 🚀 Get Running in 5 Minutes

### Step 1: Install Prerequisites
1. **Node.js**: Download from [nodejs.org](https://nodejs.org/) (LTS version)
2. **Docker Desktop**: Download from [docker.com](https://www.docker.com/products/docker-desktop/)
3. **Git**: Download from [git-scm.com](https://git-scm.com/download/win)

### Step 2: Clone & Setup
```cmd
# Open Command Prompt as Administrator
git clone <your-repo-url> evangelism-app
cd evangelism-app

# Copy environment files
copy backend\env.example backend\.env
copy frontend\.env.example frontend\.env.local
```

### Step 3: Get API Keys (2 minutes)
1. **OpenAI API**: Go to [platform.openai.com](https://platform.openai.com/) → Create API key
2. **Gmail App Password**: Google Account → Security → App passwords → Generate

### Step 4: Configure Environment
Edit `backend\.env`:
```env
# Change these values:
JWT_SECRET="your-super-secret-key-12345"
OPENAI_API_KEY="sk-proj-your-openai-key"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### Step 5: Start Application
```cmd
# Start everything
docker-compose up -d

# Initialize database
docker-compose exec backend npx prisma db push
docker-compose exec backend npm run db:seed

# Access the app
start http://localhost:3000
```

## 🎉 You're Done!

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Test Login**: admin@evangelismapp.com / admin123

## 🔧 If Something Goes Wrong

```cmd
# Check if containers are running
docker-compose ps

# View logs
docker-compose logs -f

# Restart everything
docker-compose down
docker-compose up -d
```

## 📚 Full Documentation
- [WINDOWS_SETUP_GUIDE.md](WINDOWS_SETUP_GUIDE.md) - Detailed setup
- [API_INTEGRATION_GUIDE.md](API_INTEGRATION_GUIDE.md) - API configuration
- [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) - Production hosting

---

**Ready to transform lives!** 🙏✨



