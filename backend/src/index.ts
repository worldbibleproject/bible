import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import 'express-async-errors';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import seekerRoutes from './routes/seekers';
import mentorRoutes from './routes/mentors';
import churchRoutes from './routes/churches';
import sessionRoutes from './routes/sessions';
import groupSessionRoutes from './routes/groupSessions';
import messageRoutes from './routes/messages';
import wizardRoutes from './routes/wizard';
import adminRoutes from './routes/admin';
import videoRoutes from './routes/video';
import handoffRoutes from './routes/handoff';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { rateLimiter } from './middleware/rateLimiter';

// Import socket handlers
import { setupSocketHandlers } from './socket/socketHandlers';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/seekers', seekerRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/churches', churchRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/group-sessions', groupSessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/wizard', wizardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/handoff', handoffRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Setup socket handlers
setupSocketHandlers(io);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export { io };
