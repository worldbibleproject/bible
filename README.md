# 🙏 Evangelism App

A modern, AI-powered evangelism platform that connects seekers with mentors and helps them find local churches. Built with React, Node.js, and powered by OpenAI for personalized spiritual guidance.

## ✨ Features

### 🤖 AI-Powered Spiritual Wizard
- **Personalized Scripture Selection**: AI analyzes your spiritual journey and selects relevant Bible verses
- **Custom Prayer Generation**: Tailored prayers based on your specific needs and struggles
- **Spiritual Guidance**: Intelligent recommendations for your faith journey

### 👥 Mentorship System
- **Smart Matching**: AI-powered algorithm matches seekers with compatible mentors
- **1-on-1 Sessions**: Private mentoring sessions with video calling
- **Group Sessions**: Targeted group calls (e.g., "Porn Addiction Recovery", "Marriage Counseling")
- **Availability Management**: Mentors can set their schedules and availability

### 🏛️ Church Finder
- **Local Church Database**: Comprehensive database of churches
- **Seeker-Church Matching**: Connect seekers with appropriate local churches
- **Church Vetting**: Verified and vetted church recommendations

### 🔐 Secure & Modern
- **JWT Authentication**: Secure user authentication and authorization
- **Role-Based Access**: Seeker, Mentor, Church Finder, and Admin roles
- **Real-time Messaging**: WebSocket-powered chat system
- **File Uploads**: Secure document and image sharing

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern, responsive styling
- **React Query** - Data fetching and caching
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type-safe development
- **Prisma** - Database ORM
- **MySQL** - Database
- **Socket.io** - Real-time communication
- **OpenAI API** - AI-powered features

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and load balancer

## 📦 Installation

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MySQL (or use Docker)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/evangelism-app.git
   cd evangelism-app
   ```

2. **Set up environment variables**
   ```bash
   cp backend/env.example backend/.env
   # Edit backend/.env with your API keys
   ```

3. **Start with Docker**
   ```bash
   docker-compose up -d
   ```

4. **Import Bible data**
   ```bash
   # Place your CSV file at backend/bible-verses.csv
   docker-compose exec backend npx tsx src/scripts/import-csv-bible.ts
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

## 🔑 Required API Keys

### OpenAI API Key
- **Purpose**: AI-powered wizard and mentor matching
- **Get it**: https://platform.openai.com/api-keys
- **Cost**: ~$0.01-0.10 per wizard session

### Gmail SMTP (Optional)
- **Purpose**: Email invitations and notifications
- **Setup**: Enable 2FA → Create App Password
- **Cost**: Free

### Zoom API (Optional)
- **Purpose**: Video calling for sessions
- **Get it**: https://marketplace.zoom.us/
- **Cost**: Free tier available

## 🎯 User Roles

### 👤 Seeker
- Complete spiritual journey assessment
- Get AI-generated personalized Scripture
- Connect with compatible mentors
- Find local churches
- Join group sessions

### 👨‍🏫 Mentor
- Set up detailed profile and availability
- Create targeted group sessions
- Manage mentee relationships
- Conduct 1-on-1 and group sessions

### 🏛️ Church Finder
- Add and manage church database
- Connect seekers with local churches
- Vet and verify church information

### 👑 Admin
- Approve user registrations
- Send mentor/church finder invitations
- Monitor system statistics
- Manage user accounts

## 📊 Database Schema

### Core Tables
- `users` - User accounts and authentication
- `seeker_profiles` - Detailed seeker information
- `mentor_profiles` - Mentor expertise and availability
- `churches` - Church database
- `bible_verses_web` - Bible verse database

### Relationship Tables
- `mentor_relationships` - Seeker-mentor connections
- `church_connections` - Seeker-church connections
- `sessions` - 1-on-1 mentoring sessions
- `group_sessions` - Group session templates

## 🚀 Deployment

### Production Deployment
1. **Set up server** (Digital Ocean recommended)
2. **Configure domain** and DNS
3. **Set up SSL** certificate
4. **Deploy with Docker**
5. **Configure production API keys**

See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for detailed instructions.

## 📱 Features Overview

### AI Wizard Flow
1. **Assessment**: Answer questions about your spiritual journey
2. **AI Analysis**: OpenAI processes your responses
3. **Personalized Results**: Get custom Scripture selections and prayers
4. **Next Steps**: Connect with mentors or find churches

### Mentorship Flow
1. **Mentor Registration**: Complete profile and set availability
2. **AI Matching**: System matches seekers with compatible mentors
3. **Connection**: Seeker requests mentorship
4. **Sessions**: Conduct 1-on-1 or group sessions
5. **Progress Tracking**: Monitor spiritual growth

### Church Finder Flow
1. **Church Database**: Comprehensive local church information
2. **Seeker Matching**: Connect seekers with appropriate churches
3. **Verification**: Vetted and verified church recommendations
4. **Follow-up**: Track connection success

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation files
- Review the setup guides

## 🎉 Acknowledgments

- **OpenAI** for AI-powered spiritual guidance
- **Prisma** for database management
- **Next.js** team for the amazing React framework
- **Tailwind CSS** for beautiful styling

---

**Built with ❤️ for the Kingdom of God**