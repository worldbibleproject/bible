import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/database';
import { authenticate, requireRole } from '../middleware/auth';
import { sendInvitationEmail } from '../lib/email';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const seekers = await prisma.user.count({ where: { userRole: 'SEEKER' } });
    const mentors = await prisma.user.count({ where: { userRole: 'DISCIPLE_MAKER' } });
    const churchFinders = await prisma.user.count({ where: { userRole: 'CHURCH_FINDER' } });
    const pendingApprovals = await prisma.user.count({ where: { isApproved: false } });

    const totalSessions = await prisma.session.count();
    const completedSessions = await prisma.session.count({ where: { status: 'COMPLETED' } });
    const totalChurches = await prisma.church.count();
    const vettedChurches = await prisma.church.count({ where: { isVetted: true } });

    const totalMessages = await prisma.message.count();
    const totalConnections = await prisma.churchConnection.count();

    res.json({
      users: {
        total: totalUsers,
        seekers,
        mentors,
        churchFinders,
        pendingApprovals
      },
      sessions: {
        total: totalSessions,
        completed: completedSessions
      },
      churches: {
        total: totalChurches,
        vetted: vettedChurches
      },
      engagement: {
        messages: totalMessages,
        connections: totalConnections
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to get admin statistics' });
  }
});

// Get pending approvals
router.get('/pending-approvals', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;

    const where: any = {
      isApproved: false,
      isActive: true
    };

    if (role) {
      where.userRole = role;
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        mentorProfile: true,
        seekerProfile: true
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.user.count({ where });

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ error: 'Failed to get pending approvals' });
  }
});

// Approve user
router.patch('/users/:id/approve', authenticate, requireRole(['ADMIN']), [
  body('approved').isBoolean().withMessage('Approval status is required'),
  body('notes').optional().isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { approved, notes } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        isApproved: approved,
        approvalDate: approved ? new Date() : null
      },
      select: {
        id: true,
        username: true,
        email: true,
        userRole: true,
        isApproved: true,
        approvalDate: true
      }
    });

    res.json({ user });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
});

// Invite user
router.post('/invite', authenticate, requireRole(['ADMIN']), [
  body('email').isEmail().withMessage('Valid email is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').isIn(['DISCIPLE_MAKER', 'CHURCH_FINDER']).withMessage('Invalid role'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, role } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Check if invitation already exists and is not expired
    const existingInvitation = await prisma.userInvitation.findFirst({
      where: {
        email,
        used: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (existingInvitation) {
      return res.status(409).json({ error: 'Invitation already sent' });
    }

    // Generate invitation token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.userInvitation.create({
      data: {
        email,
        name,
        role,
        token,
        expiresAt
      }
    });

    // Send invitation email
    await sendInvitationEmail(email, name, role, token);

    res.json({ invitation });
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

// Get all invitations
router.get('/invitations', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { page = 1, limit = 10, used } = req.query;

    const where: any = {};
    if (used !== undefined) {
      where.used = used === 'true';
    }

    const invitations = await prisma.userInvitation.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.userInvitation.count({ where });

    res.json({
      invitations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ error: 'Failed to get invitations' });
  }
});

// Get system logs
router.get('/logs', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { page = 1, limit = 50, type } = req.query;

    // This would typically come from a logging system
    // For now, we'll return a placeholder
    res.json({
      logs: [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: 0,
        pages: 0
      }
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

// Get user activity
router.get('/users/:id/activity', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        email: true,
        userRole: true,
        createdAt: true,
        lastLoginAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's recent activity
    const recentSessions = await prisma.session.findMany({
      where: {
        OR: [
          { mentorId: parseInt(id) },
          { participants: { some: { seekerId: parseInt(id) } } }
        ]
      },
      include: {
        participants: {
          include: {
            seeker: {
              select: {
                user: {
                  select: {
                    username: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const recentMessages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: parseInt(id) },
          { recipientId: parseInt(id) }
        ]
      },
      include: {
        sender: {
          select: { username: true }
        },
        recipient: {
          select: { username: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json({
      user,
      activity: {
        sessions: recentSessions,
        messages: recentMessages
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ error: 'Failed to get user activity' });
  }
});

export default router;


