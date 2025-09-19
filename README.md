# Evangelism App - Complete Production Setup

A comprehensive evangelism and discipleship platform with AI-powered spiritual guidance, mentor matching, church connections, and video calling capabilities.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Local Development
```bash
# Clone the repository
git clone https://github.com/worldbibleproject/bible.git
cd bible

# Copy environment file
cp backend/env.example .env

# Edit .env with your actual values (especially API keys)
# Required: OPENAI_API_KEY, EMAIL_USER, EMAIL_PASS

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### First Time Setup
```bash
# After starting services, seed the database
docker-compose exec backend npm run db:seed

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# Health Check: http://localhost:5000/health
```

### Production Deployment
```bash
# Deploy to Digital Ocean
curl -o deploy-to-digitalocean.sh https://raw.githubusercontent.com/worldbibleproject/bible/main/deploy-to-digitalocean.sh
chmod +x deploy-to-digitalocean.sh
./deploy-to-digitalocean.sh
```

## 📁 Project Structure

```
evangelism-app/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── lib/           # Services (auth, email, zoom, etc.)
│   │   ├── middleware/    # Auth, error handling
│   │   └── socket/        # WebSocket handlers
│   ├── prisma/            # Database schema
│   └── Dockerfile
├── frontend/               # Next.js React app
│   ├── src/
│   │   ├── app/           # Next.js 14 app router
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── lib/           # Utilities
│   └── Dockerfile
├── nginx/                  # Reverse proxy config
├── docker-compose.yml      # Local development
├── docker-compose.prod.yml # Production deployment
└── deploy-to-digitalocean.sh # Deployment script
```

## 🔧 Features

### Core Features
- **AI Spiritual Wizard**: Personalized guidance using OpenAI
- **User Management**: Seeker, Mentor, Church Finder, Admin roles
- **Mentor Matching**: AI-powered mentor-seeker matching
- **Church Connections**: Connect seekers with local churches
- **Video Calling**: Zoom integration for sessions
- **Scheduling**: Calendar-based session booking
- **Messaging**: Real-time chat system

### User Types
1. **Seeker**: Someone seeking spiritual guidance
2. **Mentor**: Experienced Christian providing guidance
3. **Church Finder**: Helps connect seekers with churches
4. **Admin**: Platform administration

## 🛠 Technology Stack

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma** ORM with MySQL
- **Socket.io** for real-time communication
- **OpenAI API** for AI features
- **Zoom SDK** for video calling
- **JWT** authentication

### Frontend
- **Next.js 14** with App Router
- **React** with TypeScript
- **Tailwind CSS** for styling
- **React Query** for data fetching
- **Socket.io Client** for real-time features

### Infrastructure
- **Docker** containerization
- **Nginx** reverse proxy
- **MySQL** database
- **Digital Ocean** hosting

## 🔐 Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL=mysql://evangelism_user:evangelism_password@mysql:3306/evangelism_db

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# OpenAI API
OPENAI_API_KEY=sk-proj-your-openai-api-key

# Zoom API (Optional)
ZOOM_API_KEY=your-zoom-api-key
ZOOM_API_SECRET=your-zoom-api-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 📊 Database Schema

The app uses a comprehensive MySQL schema with tables for:
- Users and profiles
- Sessions and mentoring relationships
- Church connections
- Messages and notifications
- AI wizard data
- Bible verses and references

## 🚀 Deployment

### Digital Ocean Setup
1. Create a droplet (Ubuntu 22.04)
2. Run the deployment script
3. Update environment variables
4. Set up SSL with Certbot

### Manual Deployment
```bash
# Clone repository
git clone https://github.com/worldbibleproject/bible.git
cd bible

# Set up environment
cp env.production .env
# Edit .env with your values

# Deploy
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Wizard
- `POST /api/wizard/process` - Process wizard responses
- `GET /api/wizard/results/:id` - Get wizard results

### Users & Profiles
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/mentors` - List mentors
- `GET /api/seekers` - List seekers

### Sessions
- `POST /api/sessions` - Create session
- `GET /api/sessions` - List sessions
- `PUT /api/sessions/:id` - Update session

### Video Calling
- `POST /api/video/create-meeting` - Create Zoom meeting
- `GET /api/video/meetings` - List meetings

## 🧪 Testing

```bash
# Test API endpoints
curl http://localhost:5000/health
curl http://localhost:5000/api/auth/login

# Test frontend
curl http://localhost:3000
```

## 📝 Development

### Adding New Features
1. Create backend routes in `backend/src/routes/`
2. Add frontend components in `frontend/src/components/`
3. Update database schema in `backend/prisma/schema.prisma`
4. Run `npx prisma db push` to update database

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Use Tailwind CSS for styling
- Implement proper error handling

## 🆘 Troubleshooting

### Common Issues
1. **Database connection**: Check DATABASE_URL in .env file
2. **API keys**: Verify OpenAI and Zoom API keys are set
3. **Docker issues**: Run `docker system prune -f`
4. **Build failures**: Check TypeScript errors
5. **Port conflicts**: Ensure ports 3000, 5000, and 3306 are available
6. **Permission issues**: On Linux/Mac, ensure Docker has proper permissions

### Health Checks
```bash
# Check if services are running
docker-compose ps

# Test API health
curl http://localhost:5000/health

# Test frontend
curl http://localhost:3000
```

### Database Issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d

# Re-seed database
docker-compose exec backend npm run db:seed

# Access database directly
docker-compose exec mysql mysql -u evangelism_user -p evangelism_db
```

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# View logs with timestamps
docker-compose logs -f -t
```

### Development Mode
```bash
# Run backend in development mode
cd backend
npm install
npm run dev

# Run frontend in development mode
cd frontend
npm install
npm run dev
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

