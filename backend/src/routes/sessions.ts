import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/database';
import { authenticate, AuthenticatedRequest, requireRole, requireApproval } from '../middleware/auth';

const router = express.Router();

// Get all sessions (for admin)
router.get('/', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, mentorId } = req.query;

    const where: any = {};
    if (type) where.sessionType = type;
    if (status) where.status = status;
    if (mentorId) where.mentorId = parseInt(mentorId as string);

    const sessions = await prisma.session.findMany({
      where,
      include: {
        mentor: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        },
        participants: {
          include: {
            seeker: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { scheduledTime: 'desc' }
    });

    const total = await prisma.session.count({ where });

    res.json({
      sessions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

// Get session details
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const session = await prisma.session.findUnique({
      where: { id: parseInt(id) },
      include: {
        mentor: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                location: true
              }
            }
          }
        },
        participants: {
          include: {
            seeker: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true,
                    location: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if user has access to this session
    const hasAccess = 
      req.user!.role === 'ADMIN' ||
      session.mentorId === req.user!.userId ||
      session.participants.some(p => p.seekerId === req.user!.userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Get session details error:', error);
    res.status(500).json({ error: 'Failed to get session details' });
  }
});

// Update session status
router.patch('/:id/status', authenticate, [
  body('status').isIn(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).withMessage('Invalid status'),
  body('notes').optional().isString(),
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    const session = await prisma.session.findUnique({
      where: { id: parseInt(id) },
      select: { mentorId: true }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if user can update this session
    if (req.user!.role !== 'ADMIN' && session.mentorId !== req.user!.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedSession = await prisma.session.update({
      where: { id: parseInt(id) },
      data: {
        status,
        notes
      }
    });

    res.json({ session: updatedSession });
  } catch (error) {
    console.error('Update session status error:', error);
    res.status(500).json({ error: 'Failed to update session status' });
  }
});

// Update participant status
router.patch('/:id/participants/:participantId', authenticate, [
  body('status').isIn(['INVITED', 'ACCEPTED', 'DECLINED', 'ATTENDED', 'NO_SHOW']).withMessage('Invalid status'),
  body('feedback').optional().isString(),
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id, participantId } = req.params;
    const { status, feedback } = req.body;

    const participant = await prisma.sessionParticipant.findUnique({
      where: { id: parseInt(participantId) },
      include: {
        session: {
          select: { mentorId: true }
        }
      }
    });

    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    // Check if user can update this participant
    const canUpdate = 
      req.user!.role === 'ADMIN' ||
      participant.session.mentorId === req.user!.userId ||
      participant.seekerId === req.user!.userId;

    if (!canUpdate) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedParticipant = await prisma.sessionParticipant.update({
      where: { id: parseInt(participantId) },
      data: {
        status,
        feedback,
        joinedAt: status === 'ACCEPTED' ? new Date() : undefined,
        leftAt: ['DECLINED', 'ATTENDED', 'NO_SHOW'].includes(status) ? new Date() : undefined
      }
    });

    res.json({ participant: updatedParticipant });
  } catch (error) {
    console.error('Update participant status error:', error);
    res.status(500).json({ error: 'Failed to update participant status' });
  }
});

// Get session statistics
router.get('/stats/overview', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const totalSessions = await prisma.session.count();
    const scheduledSessions = await prisma.session.count({
      where: { status: 'SCHEDULED' }
    });
    const completedSessions = await prisma.session.count({
      where: { status: 'COMPLETED' }
    });
    const cancelledSessions = await prisma.session.count({
      where: { status: 'CANCELLED' }
    });

    const groupSessions = await prisma.session.count({
      where: { sessionType: 'GROUP' }
    });
    const oneOnOneSessions = await prisma.session.count({
      where: { sessionType: 'ONE_ON_ONE' }
    });

    const totalParticipants = await prisma.sessionParticipant.count();
    const attendedParticipants = await prisma.sessionParticipant.count({
      where: { status: 'ATTENDED' }
    });

    res.json({
      totalSessions,
      scheduledSessions,
      completedSessions,
      cancelledSessions,
      groupSessions,
      oneOnOneSessions,
      totalParticipants,
      attendedParticipants,
      attendanceRate: totalParticipants > 0 ? (attendedParticipants / totalParticipants) * 100 : 0
    });
  } catch (error) {
    console.error('Get session statistics error:', error);
    res.status(500).json({ error: 'Failed to get session statistics' });
  }
});

export default router;


