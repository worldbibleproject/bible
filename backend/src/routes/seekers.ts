import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/database';
import { authenticate, AuthenticatedRequest, requireRole } from '../middleware/auth';

const router = express.Router();

// Get seeker profile
router.get('/profile', authenticate, requireRole(['SEEKER']), async (req: AuthenticatedRequest, res) => {
  try {
    const profile = await prisma.seekerProfile.findUnique({
      where: { userId: req.user!.userId }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Seeker profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Get seeker profile error:', error);
    res.status(500).json({ error: 'Failed to get seeker profile' });
  }
});

// Create/Update seeker profile
router.post('/profile', authenticate, requireRole(['SEEKER']), [
  body('maritalStatus').optional().isString(),
  body('struggles').optional().isArray(),
  body('currentSituation').optional().isString(),
  body('helpNeeded').optional().isString(),
  body('faithLevel').optional().isString(),
  body('churchBackground').optional().isString(),
  body('spiritualJourney').optional().isString(),
  body('faithQuestions').optional().isString(),
  body('preferredFormat').optional().isIn(['1on1', 'group', 'both']),
  body('preferredCommunication').optional().isIn(['video', 'chat', 'both']),
  body('mentorGenderPreference').optional().isString(),
  body('mentorAgePreference').optional().isString(),
  body('sessionFrequency').optional().isString(),
  body('groupInterests').optional().isArray(),
  body('mentoringGoals').optional().isString(),
  body('mentorExpectations').optional().isString(),
  body('commitmentLevel').optional().isString(),
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const profileData = req.body;

    const profile = await prisma.seekerProfile.upsert({
      where: { userId: req.user!.userId },
      update: profileData,
      create: {
        userId: req.user!.userId,
        ...profileData
      }
    });

    res.json({ profile });
  } catch (error) {
    console.error('Create/update seeker profile error:', error);
    res.status(500).json({ error: 'Failed to save seeker profile' });
  }
});

// Get available mentors with AI-powered matching
router.get('/mentors', authenticate, requireRole(['SEEKER']), async (req: AuthenticatedRequest, res) => {
  try {
    const { page = 1, limit = 10, specialty, location, useAI = 'true' } = req.query;

    // If AI matching is enabled, use advanced algorithm
    if (useAI === 'true') {
      const { findMentorMatches, getAIMentorRecommendations } = await import('../lib/matching');
      
      // Get AI-powered matches
      const matches = await findMentorMatches(req.user!.userId, Number(limit));
      
      // Get AI recommendations for top matches
      const enhancedMatches = await getAIMentorRecommendations(req.user!.userId, matches.slice(0, 5));
      
      res.json({
        mentors: enhancedMatches,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: enhancedMatches.length,
          pages: Math.ceil(enhancedMatches.length / Number(limit))
        },
        aiPowered: true
      });
      return;
    }

    // Fallback to basic filtering
    const where: any = {
      isActive: true,
      user: {
        isApproved: true,
        userRole: 'DISCIPLE_MAKER'
      }
    };

    if (specialty) {
      where.specialties = {
        path: '$',
        array_contains: specialty
      };
    }

    const mentors = await prisma.mentorProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            location: true,
            ageRange: true,
            gender: true
          }
        }
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.mentorProfile.count({ where });

    res.json({
      mentors,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      aiPowered: false
    });
  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({ error: 'Failed to get mentors' });
  }
});

// Get mentor details
router.get('/mentors/:id', authenticate, requireRole(['SEEKER']), async (req, res) => {
  try {
    const { id } = req.params;

    const mentor = await prisma.mentorProfile.findUnique({
      where: { userId: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            location: true,
            ageRange: true,
            gender: true,
            createdAt: true
          }
        }
      }
    });

    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    res.json({ mentor });
  } catch (error) {
    console.error('Get mentor details error:', error);
    res.status(500).json({ error: 'Failed to get mentor details' });
  }
});

// Request mentor relationship
router.post('/mentors/:id/request', authenticate, requireRole(['SEEKER']), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    // Check if relationship already exists
    const existingRelationship = await prisma.mentorRelationship.findFirst({
      where: {
        mentorId: parseInt(id),
        seekerId: req.user!.userId
      }
    });

    if (existingRelationship) {
      return res.status(409).json({ error: 'Relationship request already exists' });
    }

    const relationship = await prisma.mentorRelationship.create({
      data: {
        mentorId: parseInt(id),
        seekerId: req.user!.userId,
        status: 'pending',
        notes: message
      }
    });

    res.json({ relationship });
  } catch (error) {
    console.error('Request mentor relationship error:', error);
    res.status(500).json({ error: 'Failed to request mentor relationship' });
  }
});

// Get my mentor relationships
router.get('/mentor-relationships', authenticate, requireRole(['SEEKER']), async (req: AuthenticatedRequest, res) => {
  try {
    const relationships = await prisma.mentorRelationship.findMany({
      where: { seekerId: req.user!.userId },
      include: {
        mentor: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                location: true,
                ageRange: true,
                gender: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ relationships });
  } catch (error) {
    console.error('Get mentor relationships error:', error);
    res.status(500).json({ error: 'Failed to get mentor relationships' });
  }
});

// Get available group sessions
router.get('/group-sessions', authenticate, requireRole(['SEEKER']), async (req, res) => {
  try {
    const { page = 1, limit = 10, topic } = req.query;

    const where: any = {
      sessionType: 'GROUP',
      status: 'SCHEDULED',
      scheduledTime: { gte: new Date() }
    };

    if (topic) {
      where.topic = topic;
    }

    const sessions = await prisma.session.findMany({
      where,
      include: {
        mentor: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                location: true
              }
            }
          }
        },
        participants: {
          where: { seekerId: req.user!.userId },
          select: { status: true }
        }
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { scheduledTime: 'asc' }
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

// Join group session
router.post('/group-sessions/:id/join', authenticate, requireRole(['SEEKER']), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const session = await prisma.session.findUnique({
      where: { id: parseInt(id) },
      include: {
        participants: true
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.currentParticipants >= session.maxParticipants) {
      return res.status(400).json({ error: 'Session is full' });
    }

    // Check if already joined
    const existingParticipant = session.participants.find(p => p.seekerId === req.user!.userId);
    if (existingParticipant) {
      return res.status(409).json({ error: 'Already joined this session' });
    }

    const participant = await prisma.sessionParticipant.create({
      data: {
        sessionId: parseInt(id),
        seekerId: req.user!.userId,
        status: 'ACCEPTED'
      }
    });

    // Update session participant count
    await prisma.session.update({
      where: { id: parseInt(id) },
      data: {
        currentParticipants: { increment: 1 }
      }
    });

    res.json({ participant });
  } catch (error) {
    console.error('Join group session error:', error);
    res.status(500).json({ error: 'Failed to join group session' });
  }
});

export default router;
