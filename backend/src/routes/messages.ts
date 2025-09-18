import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/database';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { io } from '../index';

const router = express.Router();

// Get messages between users
router.get('/conversation/:userId', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: req.user!.userId,
            recipientId: parseInt(userId)
          },
          {
            senderId: parseInt(userId),
            recipientId: req.user!.userId
          }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            userRole: true
          }
        },
        recipient: {
          select: {
            id: true,
            username: true,
            userRole: true
          }
        }
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

// Send message
router.post('/send', authenticate, [
  body('recipientId').isInt().withMessage('Recipient ID is required'),
  body('content').notEmpty().withMessage('Message content is required'),
  body('messageType').optional().isIn(['TEXT', 'VIDEO_CALL', 'FILE']).withMessage('Invalid message type'),
  body('sessionId').optional().isInt().withMessage('Invalid session ID'),
  body('filePath').optional().isString(),
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recipientId, content, messageType = 'TEXT', sessionId, filePath } = req.body;

    // Check if recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, username: true, isActive: true }
    });

    if (!recipient || !recipient.isActive) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const message = await prisma.message.create({
      data: {
        senderId: req.user!.userId,
        recipientId,
        content,
        messageType,
        sessionId: sessionId || null,
        filePath: filePath || null
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            userRole: true
          }
        },
        recipient: {
          select: {
            id: true,
            username: true,
            userRole: true
          }
        }
      }
    });

    // Emit real-time message
    io.to(`user_${recipientId}`).emit('new_message', message);

    res.json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark message as read
router.patch('/:id/read', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const message = await prisma.message.findUnique({
      where: { id: parseInt(id) },
      select: { recipientId: true, isRead: true }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.recipientId !== req.user!.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (message.isRead) {
      return res.json({ message: 'Message already read' });
    }

    const updatedMessage = await prisma.message.update({
      where: { id: parseInt(id) },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({ message: updatedMessage });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// Get unread message count
router.get('/unread-count', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const count = await prisma.message.count({
      where: {
        recipientId: req.user!.userId,
        isRead: false
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Get conversations list
router.get('/conversations', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user!.userId },
          { recipientId: req.user!.userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            userRole: true
          }
        },
        recipient: {
          select: {
            id: true,
            username: true,
            userRole: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['senderId', 'recipientId']
    });

    // Group by conversation partner
    const conversationMap = new Map();
    
    conversations.forEach(message => {
      const partnerId = message.senderId === req.user!.userId ? message.recipientId : message.senderId;
      const partner = message.senderId === req.user!.userId ? message.recipient : message.sender;
      
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partner,
          lastMessage: message,
          unreadCount: 0
        });
      }
    });

    // Get unread counts
    for (const [partnerId, conversation] of conversationMap) {
      const unreadCount = await prisma.message.count({
        where: {
          senderId: partnerId,
          recipientId: req.user!.userId,
          isRead: false
        }
      });
      conversation.unreadCount = unreadCount;
    }

    const conversationList = Array.from(conversationMap.values());

    res.json({ conversations: conversationList });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Delete message
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const message = await prisma.message.findUnique({
      where: { id: parseInt(id) },
      select: { senderId: true }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId !== req.user!.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.message.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;


