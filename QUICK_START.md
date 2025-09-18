# Evangelism App - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Git installed
- Basic understanding of command line

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd evangelism-app
```

### 2. Environment Configuration
```bash
# Copy environment file
cp .env.example backend/.env

# Edit backend/.env with your API keys:
# - OPENAI_API_KEY (required for AI wizard)
# - ZOOM_API_KEY (required for video calls)
# - ZOOM_API_SECRET (required for video calls)
# - EMAIL credentials (optional)
```

### 3. Start the Application
```bash
# Windows
setup-windows.bat

# Or manually:
docker-compose up -d
```

### 4. Initialize Database
```bash
# Run database migrations
docker-compose exec backend npx prisma db push

# Generate Prisma client
docker-compose exec backend npx prisma generate

# Seed with sample data
docker-compose exec backend npx prisma db seed
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:3306

## 🔑 Default Login Credentials

### Admin Account
- **Email**: admin@evangelismapp.com
- **Password**: admin123
- **Access**: Full admin dashboard

### Mentor Account
- **Email**: mentor1@example.com
- **Password**: mentor123
- **Access**: Mentor dashboard, availability management

### Seeker Account
- **Email**: seeker1@example.com
- **Password**: seeker123
- **Access**: Seeker dashboard, mentor matching

## 📱 Key Features

### For Seekers
1. **AI Wizard**: Take the spiritual assessment
2. **Church Finder**: Search for churches by location/denomination
3. **Mentor Matching**: Find and connect with mentors
4. **Video Calls**: Schedule and join mentorship sessions
5. **Bible Study**: Access verses and study materials

### For Mentors
1. **Profile Setup**: Complete mentor profile
2. **Availability Management**: Set available hours
3. **Session Scheduling**: Manage mentorship sessions
4. **Video Calls**: Host video sessions with seekers
5. **Progress Tracking**: Monitor seeker progress

### For Admins
1. **User Management**: Manage all users and roles
2. **Church Management**: Add and verify churches
3. **System Monitoring**: View analytics and reports
4. **Content Management**: Manage Bible verses and resources

## 🛠 Development Commands

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Database Management
```bash
# View database
docker-compose exec mysql mysql -u evangelism_user -p evangelism_app

# Run migrations
docker-compose exec backend npx prisma db push

# Generate Prisma client
docker-compose exec backend npx prisma generate

# Open Prisma Studio
docker-compose exec backend npx prisma studio
```

## 🚀 Production Deployment

### Digital Ocean Deployment
1. Run `DEPLOY_TO_DIGITAL_OCEAN.bat`
2. Follow the step-by-step instructions
3. Configure environment variables
4. Access your deployed app

### Manual Deployment
1. Create a Digital Ocean droplet
2. Install Docker and Docker Compose
3. Clone your repository
4. Configure environment variables
5. Run `docker-compose -f docker-compose.prod.yml up -d`

## 🔧 Troubleshooting

### Common Issues

#### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Restart services
docker-compose restart backend
```

#### Database connection issues
```bash
# Check MySQL status
docker-compose ps mysql

# Restart MySQL
docker-compose restart mysql
```

#### Frontend build errors
```bash
# Clear Next.js cache
docker-compose exec frontend rm -rf .next

# Rebuild frontend
docker-compose build frontend
```

### Getting Help
- Check the logs: `docker-compose logs -f`
- Verify environment variables
- Ensure all required API keys are configured
- Check Docker and Docker Compose versions

## 📚 Additional Resources

- [API Documentation](API_DOCUMENTATION.md)
- [Database Schema](DATABASE_SCHEMA.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)

---

**Need help?** Create an issue in the repository or contact support.
