import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/database';

export const setupSocketHandlers = (io: Server) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key') as any;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, username: true, userRole: true, isActive: true }
      });

      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`User ${user.username} connected`);

    // Join user to their personal room
    socket.join(`user_${user.id}`);

    // Join user to role-based rooms
    socket.join(`role_${user.userRole}`);

    // Handle joining conversation rooms
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
        userId: user.id,
        username: user.username,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
        userId: user.id,
        username: user.username,
        isTyping: false
      });
    });

    // Handle session updates
    socket.on('session_update', async (data) => {
      try {
        const { sessionId, status } = data;
        
        // Verify user has access to this session
        const session = await prisma.session.findUnique({
          where: { id: sessionId },
          select: { mentorId: true, participants: { select: { seekerId: true } } }
        });

        if (!session) return;

        const hasAccess = 
          user.userRole === 'ADMIN' ||
          session.mentorId === user.id ||
          session.participants.some(p => p.seekerId === user.id);

        if (!hasAccess) return;

        // Emit to all participants
        const participantIds = [session.mentorId, ...session.participants.map(p => p.seekerId)];
        participantIds.forEach(participantId => {
          io.to(`user_${participantId}`).emit('session_updated', {
            sessionId,
            status,
            updatedBy: user.id
          });
        });
      } catch (error) {
        console.error('Session update error:', error);
      }
    });

    // Handle notification updates
    socket.on('mark_notifications_read', async () => {
      try {
        await prisma.notification.updateMany({
          where: {
            userId: user.id,
            isRead: false
          },
          data: {
            isRead: true,
            readAt: new Date()
          }
        });

        socket.emit('notifications_marked_read');
      } catch (error) {
        console.error('Mark notifications read error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${user.username} disconnected`);
    });
  });

  // Broadcast functions for server-side events
  const broadcastToUser = (userId: number, event: string, data: any) => {
    io.to(`user_${userId}`).emit(event, data);
  };

  const broadcastToRole = (role: string, event: string, data: any) => {
    io.to(`role_${role}`).emit(event, data);
  };

  const broadcastToConversation = (conversationId: string, event: string, data: any) => {
    io.to(`conversation_${conversationId}`).emit(event, data);
  };

  return {
    broadcastToUser,
    broadcastToRole,
    broadcastToConversation
  };
};


