import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/database';
import { authenticate, AuthenticatedRequest, requireRole, requireApproval } from '../middleware/auth';

const router = express.Router();

// Get mentor profile
router.get('/profile', authenticate, requireRole(['DISCIPLE_MAKER']), requireApproval, async (req: AuthenticatedRequest, res) => {
  try {
    const profile = await prisma.mentorProfile.findUnique({
      where: { userId: req.user!.userId }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Mentor profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Get mentor profile error:', error);
    res.status(500).json({ error: 'Failed to get mentor profile' });
  }
});

// Create/Update mentor profile
router.post('/profile', authenticate, requireRole(['DISCIPLE_MAKER']), requireApproval, [
  body('testimony').optional().isString(),
  body('yearsChristian').optional().isString(),
  body('denomination').optional().isString(),
  body('traumas').optional().isArray(),
  body('healingStory').optional().isString(),
  body('keyScriptures').optional().isString(),
  body('specialties').optional().isArray(),
  body('additionalExpertise').optional().isString(),
  body('maxMentees').optional().isInt({ min: 1, max: 20 }),
  body('sessionTypes').optional().isIn(['1on1', 'group', 'both']),
  body('communicationPreference').optional().isIn(['video', 'chat', 'both']),
  body('sessionDuration').optional().isInt({ min: 30, max: 180 }),
  body('mentoringPhilosophy').optional().isString(),
  body('groupTopics').optional().isArray(),
  body('groupDescription').optional().isString(),
  body('availabilitySchedule').optional().isObject(),
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const profileData = req.body;

    const profile = await prisma.mentorProfile.upsert({
      where: { userId: req.user!.userId },
      update: profileData,
      create: {
        userId: req.user!.userId,
        ...profileData
      }
    });

    res.json({ profile });
  } catch (error) {
    console.error('Create/update mentor profile error:', error);
    res.status(500).json({ error: 'Failed to save mentor profile' });
  }
});

// Get my mentees
router.get('/mentees', authenticate, requireRole(['DISCIPLE_MAKER']), requireApproval, async (req: AuthenticatedRequest, res) => {
  try {
    const relationships = await prisma.mentorRelationship.findMany({
      where: { mentorId: req.user!.userId },
      include: {
        seeker: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                location: true,
                ageRange: true,
                gender: true
              }
            },
            seekerProfile: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ relationships });
  } catch (error) {
    console.error('Get mentees error:', error);
    res.status(500).json({ error: 'Failed to get mentees' });
  }
});

// Update mentor relationship status
router.patch('/mentees/:id/status', authenticate, requireRole(['DISCIPLE_MAKER']), requireApproval, [
  body('status').isIn(['pending', 'active', 'completed', 'declined']).withMessage('Invalid status'),
  body('notes').optional().isString(),
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    const relationship = await prisma.mentorRelationship.update({
      where: { id: parseInt(id) },
      data: {
        status,
        notes,
        startedAt: status === 'active' ? new Date() : undefined,
        endedAt: status === 'completed' ? new Date() : undefined
      },
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
    });

    res.json({ relationship });
  } catch (error) {
    console.error('Update mentor relationship error:', error);
    res.status(500).json({ error: 'Failed to update relationship' });
  }
});

// Create group session
router.post('/group-sessions', authenticate, requireRole(['DISCIPLE_MAKER']), requireApproval, [
  body('topic').notEmpty().withMessage('Topic is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional().isString(),
  body('scheduledTime').isISO8601().withMessage('Valid scheduled time required'),
  body('durationMinutes').optional().isInt({ min: 30, max: 180 }),
  body('maxParticipants').optional().isInt({ min: 2, max: 50 }),
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { topic, title, description, scheduledTime, durationMinutes = 60, maxParticipants = 10 } = req.body;

    const session = await prisma.session.create({
      data: {
        mentorId: req.user!.userId,
        sessionType: 'GROUP',
        topic,
        title,
        description,
        scheduledTime: new Date(scheduledTime),
        durationMinutes,
        maxParticipants,
        currentParticipants: 0,
        status: 'SCHEDULED'
      }
    });

    res.json({ session });
  } catch (error) {
    console.error('Create group session error:', error);
    res.status(500).json({ error: 'Failed to create group session' });
  }
});

// Get my group sessions
router.get('/group-sessions', authenticate, requireRole(['DISCIPLE_MAKER']), requireApproval, async (req: AuthenticatedRequest, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const where: any = {
      mentorId: req.user!.userId,
      sessionType: 'GROUP'
    };

    if (status) {
      where.status = status;
    }

    const sessions = await prisma.session.findMany({
      where,
      include: {
        participants: {
          include: {
            seeker: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    location: true
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
    console.error('Get group sessions error:', error);
    res.status(500).json({ error: 'Failed to get group sessions' });
  }
});

// Get my sessions (all types)
router.get('/sessions', authenticate, requireRole(['DISCIPLE_MAKER']), requireApproval, async (req: AuthenticatedRequest, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;

    const where: any = {
      mentorId: req.user!.userId
    };

    if (type) {
      where.sessionType = type;
    }

    if (status) {
      where.status = status;
    }

    const sessions = await prisma.session.findMany({
      where,
      include: {
        participants: {
          include: {
            seeker: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    location: true
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

export default router;


