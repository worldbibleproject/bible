# 🚀 Evangelism App - Complete Setup Guide

## 📋 Overview

This guide will help you set up the modern Evangelism App, a comprehensive platform for spiritual guidance, mentorship, and church connections. The app has been completely converted from PHP to a modern React/Node.js stack.

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, React Query
- **Backend**: Node.js with Express, TypeScript, Prisma ORM
- **Database**: MySQL 8.0
- **Real-time**: Socket.io for messaging
- **AI Integration**: OpenAI GPT-4 for personalized content
- **Deployment**: Docker containers with Nginx reverse proxy

## 🎯 Features

### For Seekers (Public Access)
- **Mini Bible Wizard**: AI-powered spiritual guidance with 50 personalized Scripture references
- **Custom Prayer**: 500+ word personalized prayer
- **Annotated Verses**: 10 verses with MacArthur-style commentary
- **Mentor Matching**: AI-powered mentor recommendations
- **Group Sessions**: Join topic-based group mentoring
- **1-on-1 Sessions**: Individual mentoring appointments
- **Church Connection**: Get connected to local churches

### For Mentors (Invite-Only)
- **Comprehensive Profiles**: Detailed profiles with specialties and experience
- **Group Session Creation**: Lead sessions on specific topics
- **Mentee Management**: Guide assigned seekers
- **Availability Scheduling**: Weekly availability grid
- **Session Management**: 1-on-1 and group sessions

### For Church Finders (Invite-Only)
- **Church Database**: Manage vetted churches
- **Seeker Matching**: Connect seekers with appropriate churches
- **Success Tracking**: Monitor connection success rates

### For Admins
- **User Management**: Invite and approve mentors/finders
- **System Oversight**: Monitor platform activity
- **Statistics Dashboard**: View platform metrics

## 🛠️ Prerequisites

- **Node.js**: 18.x or higher
- **Docker**: 20.x or higher
- **Docker Compose**: 2.x or higher
- **Git**: For cloning the repository

## 📦 Quick Start (Docker)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd evangelism-app
```

### 2. Environment Setup
```bash
# Copy environment files
cp backend/env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit the environment files with your settings
nano backend/.env
nano frontend/.env.local
```

### 3. Configure Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL="mysql://evangelism_user:evangelism_password@mysql:3306/evangelism_app"
MYSQL_ROOT_PASSWORD="rootpassword"
MYSQL_DATABASE="evangelism_app"
MYSQL_USER="evangelism_user"
MYSQL_PASSWORD="evangelism_password"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

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
FRONTEND_URL="http://localhost:3000"
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="ws://localhost:3001"
```

### 4. Start the Application
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 5. Initialize Database
```bash
# Run database migrations
docker-compose exec backend npx prisma db push

# Seed the database (optional)
docker-compose exec backend npm run db:seed
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🛠️ Development Setup

### 1. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### 2. Database Setup
```bash
# Start MySQL (if not using Docker)
# Create database
mysql -u root -p
CREATE DATABASE evangelism_app;

# Run migrations
cd backend
npx prisma db push
npx prisma generate
```

### 3. Start Development Servers
```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:frontend  # Frontend on :3000
npm run dev:backend   # Backend on :3001
```

## 🗄️ Database Schema

The application uses Prisma ORM with MySQL. Key tables include:

- **users**: User accounts and basic information
- **seeker_profiles**: Comprehensive seeker information
- **mentor_profiles**: Detailed mentor profiles with specialties
- **sessions**: 1-on-1 and group mentoring sessions
- **churches**: Vetted church database
- **messages**: In-app messaging system
- **notifications**: User notifications
- **mini_bible_wizard_data**: Wizard responses and AI content

## 🔐 Authentication & Authorization

- **JWT-based authentication** with role-based access control
- **User Roles**: SEEKER, DISCIPLE_MAKER, CHURCH_FINDER, ADMIN
- **Invite-only system** for mentors and church finders
- **Admin approval workflow** for sensitive roles

## 🤖 AI Integration

The app integrates with OpenAI GPT-4 for:
- **Scripture Selection**: 50 personalized KJV references
- **Prayer Generation**: 500+ word custom prayers
- **Verse Commentary**: MacArthur-style annotations
- **Mentor Matching**: AI-powered compatibility scoring

## 📱 Real-time Features

- **WebSocket messaging** for real-time communication
- **Typing indicators** in conversations
- **Live notifications** for sessions and messages
- **Session updates** broadcast to participants

## 🚀 Production Deployment

### 1. Environment Configuration
```bash
# Set production environment variables
export NODE_ENV=production
export DATABASE_URL="mysql://user:pass@host:3306/db"
export JWT_SECRET="your-production-secret"
export OPENAI_API_KEY="your-openai-key"
```

### 2. SSL Certificate (Optional)
```bash
# Generate SSL certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem

# Update nginx.conf to enable HTTPS
```

### 3. Deploy with Docker
```bash
# Build and deploy
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale services if needed
docker-compose up -d --scale backend=3
```

## 📊 Monitoring & Maintenance

### Health Checks
- **Backend**: `GET /health`
- **Frontend**: Built-in Next.js health checks
- **Database**: Connection monitoring

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Database Backup
```bash
# Create backup
docker-compose exec mysql mysqldump -u root -p evangelism_app > backup.sql

# Restore backup
docker-compose exec -T mysql mysql -u root -p evangelism_app < backup.sql
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL container is running
   - Verify DATABASE_URL in .env
   - Ensure database exists

2. **OpenAI API Errors**
   - Verify OPENAI_API_KEY is set
   - Check API quota and billing
   - Review API logs

3. **Frontend Build Errors**
   - Clear Next.js cache: `rm -rf .next`
   - Reinstall dependencies: `npm ci`
   - Check environment variables

4. **Docker Issues**
   - Rebuild containers: `docker-compose build --no-cache`
   - Clean up: `docker-compose down -v`
   - Check Docker daemon is running

### Debug Mode
```bash
# Enable debug logging
export DEBUG=*
npm run dev
```

## 📈 Performance Optimization

### Frontend
- **Code splitting** with Next.js
- **Image optimization** with next/image
- **Caching** with React Query
- **Bundle analysis** with @next/bundle-analyzer

### Backend
- **Database indexing** on frequently queried fields
- **Connection pooling** with Prisma
- **Rate limiting** on API endpoints
- **Caching** for frequently accessed data

### Database
- **Proper indexing** on foreign keys and search fields
- **Query optimization** with Prisma
- **Connection pooling** configuration
- **Regular maintenance** and cleanup

## 🔒 Security Considerations

- **JWT tokens** with secure secrets
- **Rate limiting** on authentication endpoints
- **Input validation** with Joi schemas
- **SQL injection prevention** with Prisma
- **XSS protection** with proper escaping
- **CSRF protection** with tokens
- **HTTPS enforcement** in production

## 📞 Support

For technical support or questions:
1. Check this documentation first
2. Review error logs
3. Test with different configurations
4. Create an issue in the repository

## 🎉 You're Ready!

Your Evangelism App is now running! Visit http://localhost:3000 to start using the platform.

### Next Steps:
1. **Create an admin account** for user management
2. **Invite mentors** and church finders
3. **Test the wizard** functionality
4. **Configure email settings** for notifications
5. **Set up SSL** for production deployment

---

**Happy coding!** 🙏