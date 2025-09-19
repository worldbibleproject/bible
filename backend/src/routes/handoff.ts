import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/database';
import { authenticate, AuthenticatedRequest, requireRole, requireApproval } from '../middleware/auth';
import HandoffService from '../lib/handoff';

const router = express.Router();
const handoffService = new HandoffService();

// Initiate handoff from mentor to church finder
router.post('/initiate', authenticate, requireRole(['DISCIPLE_MAKER']), requireApproval, [
  body('seekerId').isInt().withMessage('Valid seeker ID required'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('seekerReadiness').isIn(['ready', 'needs_more_time', 'not_ready']).withMessage('Invalid readiness status'),
  body('notes').optional().isString(),
  body('recommendedChurches').optional().isArray()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { seekerId, reason, seekerReadiness, notes, recommendedChurches } = req.body;

    // Verify mentor-seeker relationship exists
    const relationship = await prisma.mentorRelationship.findFirst({
      where: {
        mentorId: req.user!.userId,
        seekerId: parseInt(seekerId),
        status: 'active'
      }
    });

    if (!relationship) {
      return res.status(403).json({ error: 'No active relationship with this seeker' });
    }

    await handoffService.initiateHandoff({
      mentorId: req.user!.userId,
      seekerId: parseInt(seekerId),
      reason,
      seekerReadiness,
      notes,
      recommendedChurches
    });

    res.json({ message: 'Handoff initiated successfully' });
  } catch (error) {
    console.error('Initiate handoff error:', error);
    res.status(500).json({ error: 'Failed to initiate handoff' });
  }
});

// Get handoff history for a seeker
router.get('/history/:seekerId', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { seekerId } = req.params;

    // Check if user has access to this seeker's data
    const hasAccess = 
      req.user!.role === 'ADMIN' ||
      req.user!.userId === parseInt(seekerId) ||
      await prisma.mentorRelationship.findFirst({
        where: {
          mentorId: req.user!.userId,
          seekerId: parseInt(seekerId)
        }
      }) ||
      await prisma.churchConnection.findFirst({
        where: {
          churchFinderId: req.user!.userId,
          seekerId: parseInt(seekerId)
        }
      });

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const history = await handoffService.getHandoffHistory(parseInt(seekerId));
    res.json({ history });
  } catch (error) {
    console.error('Get handoff history error:', error);
    res.status(500).json({ error: 'Failed to get handoff history' });
  }
});

// Update handoff status (church finder)
router.patch('/:connectionId/status', authenticate, requireRole(['CHURCH_FINDER']), requireApproval, [
  body('status').isIn(['PENDING', 'CONTACTED', 'VISITED', 'JOINED', 'DECLINED']).withMessage('Invalid status'),
  body('notes').optional().isString()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { connectionId } = req.params;
    const { status, notes } = req.body;

    // Verify church finder owns this connection
    const connection = await prisma.churchConnection.findUnique({
      where: { id: parseInt(connectionId) }
    });

    if (!connection || connection.churchFinderId !== req.user!.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await handoffService.updateHandoffStatus(parseInt(connectionId), status, notes);

    res.json({ message: 'Handoff status updated successfully' });
  } catch (error) {
    console.error('Update handoff status error:', error);
    res.status(500).json({ error: 'Failed to update handoff status' });
  }
});

// Get church recommendations for a seeker
router.get('/recommendations/:seekerId', authenticate, requireRole(['CHURCH_FINDER']), requireApproval, async (req: AuthenticatedRequest, res) => {
  try {
    const { seekerId } = req.params;

    const recommendations = await handoffService.generateChurchRecommendations(parseInt(seekerId));
    res.json({ recommendations });
  } catch (error) {
    console.error('Get church recommendations error:', error);
    res.status(500).json({ error: 'Failed to get church recommendations' });
  }
});

// Get pending handoffs for church finder
router.get('/pending', authenticate, requireRole(['CHURCH_FINDER']), requireApproval, async (req: AuthenticatedRequest, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const connections = await prisma.churchConnection.findMany({
      where: {
        churchFinderId: req.user!.userId,
        status: 'PENDING'
      },
      include: {
        seeker: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                location: true,
                ageRange: true,
                gender: true
              }
            },
            seekerProfile: true
          }
        },
        church: true
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.churchConnection.count({
      where: {
        churchFinderId: req.user!.userId,
        status: 'PENDING'
      }
    });

    res.json({
      connections,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get pending handoffs error:', error);
    res.status(500).json({ error: 'Failed to get pending handoffs' });
  }
});

// Get handoff statistics
router.get('/stats', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const totalHandoffs = await prisma.churchConnection.count();
    const pendingHandoffs = await prisma.churchConnection.count({ where: { status: 'PENDING' } });
    const successfulConnections = await prisma.churchConnection.count({ where: { status: 'JOINED' } });
    const declinedConnections = await prisma.churchConnection.count({ where: { status: 'DECLINED' } });

    const handoffsByMonth = await prisma.churchConnection.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1)
        }
      }
    });

    res.json({
      totalHandoffs,
      pendingHandoffs,
      successfulConnections,
      declinedConnections,
      successRate: totalHandoffs > 0 ? (successfulConnections / totalHandoffs) * 100 : 0,
      handoffsByMonth
    });
  } catch (error) {
    console.error('Get handoff statistics error:', error);
    res.status(500).json({ error: 'Failed to get handoff statistics' });
  }
});

export default router;
