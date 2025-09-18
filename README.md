# Evangelism App - Complete Platform

A comprehensive platform for evangelism, mentorship, church finding, and spiritual guidance with AI-powered features.

## 🚀 Features

### Core Features
- **AI-Powered Wizard**: Personalized spiritual guidance and Bible verse recommendations
- **Church Finder**: Locate churches by denomination, location, and preferences
- **Mentor Matching**: Connect seekers with mentors based on spiritual needs
- **Video Calling**: Integrated Zoom video calls for mentorship sessions
- **Scheduling System**: Book and manage mentorship sessions
- **User Management**: Role-based access (Admin, Mentor, Seeker)
- **Bible Integration**: Comprehensive Bible verse database and search

### Technical Features
- **Real-time Communication**: Socket.io for live updates
- **Authentication**: JWT-based secure authentication
- **Database**: MySQL with Prisma ORM
- **Email Notifications**: Automated email system
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Docker Support**: Containerized deployment

## 🛠 Tech Stack

### Backend
- Node.js + Express + TypeScript
- Prisma ORM + MySQL
- Socket.io for real-time features
- OpenAI API integration
- Zoom SDK integration
- JWT authentication
- Nodemailer for emails

### Frontend
- Next.js 14 + React + TypeScript
- Tailwind CSS for styling
- React Query for state management
- Socket.io client
- @zoom/videosdk for video calls

### Infrastructure
- Docker + Docker Compose
- MySQL 8.0
- Nginx (production)
- Digital Ocean deployment ready

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- MySQL 8.0+ (if running without Docker)

### Setup

1. **Clone and Setup**
   ```bash
   git clone <your-repo-url>
   cd evangelism-app
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment files
   cp backend/env.example backend/.env
   
   # Edit backend/.env with your API keys:
   # - OPENAI_API_KEY
   # - ZOOM_API_KEY
   # - ZOOM_API_SECRET
   # - EMAIL credentials
   ```

3. **Start with Docker**
   ```bash
   docker-compose up -d
   ```

4. **Initialize Database**
   ```bash
   # Run database migrations
   docker-compose exec backend npx prisma db push
   
   # Seed initial data
   docker-compose exec backend npx prisma db seed
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:3306

## 📁 Project Structure

```
evangelism-app/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── lib/           # Utilities and services
│   │   ├── middleware/    # Auth and validation
│   │   ├── socket/        # Socket.io handlers
│   │   └── scripts/       # Database scripts
│   ├── prisma/            # Database schema and migrations
│   └── Dockerfile
├── frontend/               # Next.js React app
│   ├── src/
│   │   ├── app/           # Next.js 14 app router
│   │   ├── components/    # React components
│   │   ├── lib/          # Utilities and API client
│   │   └── types/        # TypeScript types
│   └── Dockerfile
├── bible/                 # Bible data files
├── docker-compose.yml     # Development environment
└── README.md
```

## 🔧 Development

### Local Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
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
```

## 🚀 Production Deployment

### Digital Ocean Setup
1. Create a droplet (Ubuntu 22.04, 2GB RAM minimum)
2. Install Docker and Docker Compose
3. Clone repository
4. Configure environment variables
5. Run `docker-compose -f docker-compose.prod.yml up -d`

### Environment Variables (Production)
```bash
# Database
DATABASE_URL=mysql://user:password@localhost:3306/evangelism_app

# Security
JWT_SECRET=your-super-secure-jwt-secret

# APIs
OPENAI_API_KEY=sk-proj-your-openai-key
ZOOM_API_KEY=your-zoom-api-key
ZOOM_API_SECRET=your-zoom-api-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Wizard
- `POST /api/wizard/process` - Process wizard responses
- `GET /api/wizard/results/:id` - Get wizard results

### Churches
- `GET /api/churches` - List churches
- `GET /api/churches/search` - Search churches
- `POST /api/churches` - Create church (admin)

### Mentors
- `GET /api/mentors` - List mentors
- `GET /api/mentors/:id` - Get mentor details
- `POST /api/mentors/availability` - Set availability

### Video Calls
- `POST /api/video/create-meeting` - Create Zoom meeting
- `GET /api/video/meetings` - List user meetings
- `POST /api/video/join-meeting` - Join meeting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting guide
- Review the API documentation

---

**Built with ❤️ for spreading the Gospel**
