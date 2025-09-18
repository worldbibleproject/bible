import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/database';
import { authenticate, requireRole } from '../middleware/auth';

const router = express.Router();

// Create group session
router.post('/', authenticate, requireRole(['DISCIPLE_MAKER']), [
  body('topic').notEmpty().withMessage('Topic is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('frequency').isIn(['weekly', 'bi-weekly', 'monthly']).withMessage('Invalid frequency'),
  body('maxParticipants').isInt({ min: 2, max: 20 }).withMessage('Max participants must be between 2 and 20'),
  body('duration').isInt({ min: 30, max: 180 }).withMessage('Duration must be between 30 and 180 minutes'),
  body('schedule.day').isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).withMessage('Invalid day'),
  body('schedule.time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { topic, description, frequency, maxParticipants, duration, schedule } = req.body;

    const groupSession = await prisma.groupSession.create({
      data: {
        topic,
        description,
        frequency,
        maxParticipants,
        duration,
        mentorId: req.user!.userId,
        scheduleDay: schedule.day,
        scheduleTime: schedule.time,
        isActive: true
      }
    });

    res.status(201).json({ groupSession });
  } catch (error) {
    console.error('Create group session error:', error);
    res.status(500).json({ error: 'Failed to create group session' });
  }
});

// Get mentor's group sessions
router.get('/mentor', authenticate, requireRole(['DISCIPLE_MAKER']), async (req, res) => {
  try {
    const sessions = await prisma.groupSession.findMany({
      where: { mentorId: req.user!.userId },
      include: {
        participants: {
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
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ sessions });
  } catch (error) {
    console.error('Get mentor group sessions error:', error);
    res.status(500).json({ error: 'Failed to get group sessions' });
  }
});

// Get all available group sessions (for seekers)
router.get('/available', authenticate, requireRole(['SEEKER']), async (req, res) => {
  try {
    const { topic, frequency } = req.query;

    const where: any = {
      isActive: true,
      maxParticipants: {
        gt: prisma.groupSession.fields.participants.count()
      }
    };

    if (topic) {
      where.topic = {
        contains: topic as string,
        mode: 'insensitive'
      };
    }

    if (frequency) {
      where.frequency = frequency;
    }

    const sessions = await prisma.groupSession.findMany({
      where,
      include: {
        mentor: {
          select: {
            id: true,
            username: true,
            specialties: true,
            yearsChristian: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ sessions });
  } catch (error) {
    console.error('Get available group sessions error:', error);
    res.status(500).json({ error: 'Failed to get available group sessions' });
  }
});

// Join group session
router.post('/:id/join', authenticate, requireRole(['SEEKER']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if session exists and has space
    const session = await prisma.groupSession.findUnique({
      where: { id: parseInt(id) },
      include: {
        participants: true
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Group session not found' });
    }

    if (!session.isActive) {
      return res.status(400).json({ error: 'Group session is not active' });
    }

    if (session.participants.length >= session.maxParticipants) {
      return res.status(400).json({ error: 'Group session is full' });
    }

    // Check if already joined
    const existingParticipant = await prisma.groupParticipant.findFirst({
      where: {
        groupSessionId: parseInt(id),
        userId: req.user!.userId
      }
    });

    if (existingParticipant) {
      return res.status(400).json({ error: 'Already joined this group session' });
    }

    const participant = await prisma.groupParticipant.create({
      data: {
        groupSessionId: parseInt(id),
        userId: req.user!.userId,
        status: 'accepted'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({ participant });
  } catch (error) {
    console.error('Join group session error:', error);
    res.status(500).json({ error: 'Failed to join group session' });
  }
});

// Leave group session
router.delete('/:id/leave', authenticate, requireRole(['SEEKER']), async (req, res) => {
  try {
    const { id } = req.params;

    const participant = await prisma.groupParticipant.findFirst({
      where: {
        groupSessionId: parseInt(id),
        userId: req.user!.userId
      }
    });

    if (!participant) {
      return res.status(404).json({ error: 'Not a participant in this group session' });
    }

    await prisma.groupParticipant.delete({
      where: { id: participant.id }
    });

    res.json({ message: 'Left group session successfully' });
  } catch (error) {
    console.error('Leave group session error:', error);
    res.status(500).json({ error: 'Failed to leave group session' });
  }
});

// Update group session
router.patch('/:id', authenticate, requireRole(['DISCIPLE_MAKER']), [
  body('isActive').optional().isBoolean(),
  body('topic').optional().notEmpty(),
  body('description').optional().notEmpty(),
  body('maxParticipants').optional().isInt({ min: 2, max: 20 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if session belongs to mentor
    const session = await prisma.groupSession.findFirst({
      where: {
        id: parseInt(id),
        mentorId: req.user!.userId
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Group session not found' });
    }

    const updatedSession = await prisma.groupSession.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        participants: {
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

    res.json({ groupSession: updatedSession });
  } catch (error) {
    console.error('Update group session error:', error);
    res.status(500).json({ error: 'Failed to update group session' });
  }
});

// Invite seekers to group session
router.post('/:id/invite-seekers', authenticate, requireRole(['DISCIPLE_MAKER']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if session belongs to mentor
    const session = await prisma.groupSession.findFirst({
      where: {
        id: parseInt(id),
        mentorId: req.user!.userId
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Group session not found' });
    }

    // Get mentor's specialties
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId: req.user!.userId },
      select: { specialties: true }
    });

    if (!mentorProfile) {
      return res.status(400).json({ error: 'Mentor profile not found' });
    }

    // Find compatible seekers
    const compatibleSeekers = await prisma.user.findMany({
      where: {
        userRole: 'SEEKER',
        isApproved: true,
        isActive: true,
        struggles: {
          path: '$',
          array_contains: mentorProfile.specialties
        }
      },
      include: {
        seekerProfile: true
      }
    });

    // Create invitations for compatible seekers
    const invitations = await Promise.all(
      compatibleSeekers.map(seeker =>
        prisma.notification.create({
          data: {
            userId: seeker.id,
            type: 'GROUP_INVITATION',
            title: `Invitation to ${session.topic} Group`,
            message: `You've been invited to join the ${session.topic} group session. This group focuses on areas you're struggling with.`,
            data: {
              groupSessionId: parseInt(id),
              mentorId: req.user!.userId
            }
          }
        })
      )
    );

    res.json({ 
      message: `Invitations sent to ${invitations.length} compatible seekers`,
      invitations: invitations.length
    });
  } catch (error) {
    console.error('Invite seekers error:', error);
    res.status(500).json({ error: 'Failed to invite seekers' });
  }
});

// Get group session participants
router.get('/:id/participants', authenticate, requireRole(['DISCIPLE_MAKER']), async (req, res) => {
  try {
    const { id } = req.params;

    const session = await prisma.groupSession.findFirst({
      where: {
        id: parseInt(id),
        mentorId: req.user!.userId
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                location: true,
                ageRange: true
              }
            }
          }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Group session not found' });
    }

    res.json({ participants: session.participants });
  } catch (error) {
    console.error('Get group session participants error:', error);
    res.status(500).json({ error: 'Failed to get participants' });
  }
});

// Update participant status
router.patch('/:id/participants/:participantId', authenticate, requireRole(['DISCIPLE_MAKER']), [
  body('status').isIn(['invited', 'accepted', 'declined', 'attended', 'no_show']).withMessage('Invalid status'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id, participantId } = req.params;
    const { status } = req.body;

    // Check if session belongs to mentor
    const session = await prisma.groupSession.findFirst({
      where: {
        id: parseInt(id),
        mentorId: req.user!.userId
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Group session not found' });
    }

    const participant = await prisma.groupParticipant.update({
      where: { id: parseInt(participantId) },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    res.json({ participant });
  } catch (error) {
    console.error('Update participant status error:', error);
    res.status(500).json({ error: 'Failed to update participant status' });
  }
});

export default router;


