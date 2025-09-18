import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/database';
import { authenticate, AuthenticatedRequest, requireRole, requireApproval } from '../middleware/auth';

const router = express.Router();

// Get all churches
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, city, state, denomination, sizeCategory, vetted } = req.query;

    const where: any = {
      isActive: true
    };

    if (city) where.city = { contains: city as string };
    if (state) where.state = state;
    if (denomination) where.denomination = { contains: denomination as string };
    if (sizeCategory) where.sizeCategory = sizeCategory;
    if (vetted !== undefined) where.isVetted = vetted === 'true';

    const churches = await prisma.church.findMany({
      where,
      include: {
        vettedByUser: {
          select: {
            id: true,
            username: true
          }
        }
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.church.count({ where });

    res.json({
      churches,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get churches error:', error);
    res.status(500).json({ error: 'Failed to get churches' });
  }
});

// Get church details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const church = await prisma.church.findUnique({
      where: { id: parseInt(id) },
      include: {
        vettedByUser: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    if (!church) {
      return res.status(404).json({ error: 'Church not found' });
    }

    res.json({ church });
  } catch (error) {
    console.error('Get church details error:', error);
    res.status(500).json({ error: 'Failed to get church details' });
  }
});

// Create church (church finder only)
router.post('/', authenticate, requireRole(['CHURCH_FINDER']), requireApproval, [
  body('name').notEmpty().withMessage('Church name is required'),
  body('denomination').optional().isString(),
  body('address').optional().isString(),
  body('city').optional().isString(),
  body('state').optional().isString(),
  body('zipCode').optional().isString(),
  body('phone').optional().isString(),
  body('email').optional().isEmail(),
  body('website').optional().isURL(),
  body('pastorName').optional().isString(),
  body('serviceTimes').optional().isArray(),
  body('description').optional().isString(),
  body('specialties').optional().isArray(),
  body('sizeCategory').optional().isIn(['small', 'medium', 'large', 'mega']),
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const churchData = req.body;

    const church = await prisma.church.create({
      data: {
        ...churchData,
        vettedBy: req.user!.userId,
        isVetted: true,
        vettedDate: new Date()
      }
    });

    res.json({ church });
  } catch (error) {
    console.error('Create church error:', error);
    res.status(500).json({ error: 'Failed to create church' });
  }
});

// Update church (church finder only)
router.put('/:id', authenticate, requireRole(['CHURCH_FINDER']), requireApproval, [
  body('name').optional().isString(),
  body('denomination').optional().isString(),
  body('address').optional().isString(),
  body('city').optional().isString(),
  body('state').optional().isString(),
  body('zipCode').optional().isString(),
  body('phone').optional().isString(),
  body('email').optional().isEmail(),
  body('website').optional().isURL(),
  body('pastorName').optional().isString(),
  body('serviceTimes').optional().isArray(),
  body('description').optional().isString(),
  body('specialties').optional().isArray(),
  body('sizeCategory').optional().isIn(['small', 'medium', 'large', 'mega']),
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const churchData = req.body;

    const church = await prisma.church.update({
      where: { id: parseInt(id) },
      data: churchData
    });

    res.json({ church });
  } catch (error) {
    console.error('Update church error:', error);
    res.status(500).json({ error: 'Failed to update church' });
  }
});

// Get my churches (church finder only)
router.get('/my-churches', authenticate, requireRole(['CHURCH_FINDER']), requireApproval, async (req: AuthenticatedRequest, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const churches = await prisma.church.findMany({
      where: { vettedBy: req.user!.userId },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.church.count({
      where: { vettedBy: req.user!.userId }
    });

    res.json({
      churches,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get my churches error:', error);
    res.status(500).json({ error: 'Failed to get my churches' });
  }
});

// Get seekers for church connection (church finder only)
router.get('/seekers/available', authenticate, requireRole(['CHURCH_FINDER']), requireApproval, async (req, res) => {
  try {
    const { page = 1, limit = 10, location, faithLevel } = req.query;

    const where: any = {
      user: {
        userRole: 'SEEKER',
        isActive: true
      }
    };

    if (location) {
      where.user.location = { contains: location as string };
    }

    if (faithLevel) {
      where.faithLevel = faithLevel;
    }

    const seekers = await prisma.seekerProfile.findMany({
      where,
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
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.seekerProfile.count({ where });

    res.json({
      seekers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get available seekers error:', error);
    res.status(500).json({ error: 'Failed to get available seekers' });
  }
});

// Create church connection
router.post('/:churchId/connect/:seekerId', authenticate, requireRole(['CHURCH_FINDER']), requireApproval, [
  body('connectionNotes').optional().isString(),
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { churchId, seekerId } = req.params;
    const { connectionNotes } = req.body;

    // Check if connection already exists
    const existingConnection = await prisma.churchConnection.findFirst({
      where: {
        churchId: parseInt(churchId),
        seekerId: parseInt(seekerId)
      }
    });

    if (existingConnection) {
      return res.status(409).json({ error: 'Connection already exists' });
    }

    const connection = await prisma.churchConnection.create({
      data: {
        churchId: parseInt(churchId),
        seekerId: parseInt(seekerId),
        churchFinderId: req.user!.userId,
        connectionNotes
      },
      include: {
        church: true,
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

    res.json({ connection });
  } catch (error) {
    console.error('Create church connection error:', error);
    res.status(500).json({ error: 'Failed to create church connection' });
  }
});

// Get my church connections
router.get('/connections', authenticate, requireRole(['CHURCH_FINDER']), requireApproval, async (req: AuthenticatedRequest, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const where: any = {
      churchFinderId: req.user!.userId
    };

    if (status) {
      where.status = status;
    }

    const connections = await prisma.churchConnection.findMany({
      where,
      include: {
        church: true,
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
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.churchConnection.count({ where });

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
    console.error('Get church connections error:', error);
    res.status(500).json({ error: 'Failed to get church connections' });
  }
});

export default router;


