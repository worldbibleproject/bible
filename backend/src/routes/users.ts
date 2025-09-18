import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/database';
import { authenticate, AuthenticatedRequest, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        seekerProfile: true,
        mentorProfile: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { passwordHash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', authenticate, [
  body('location').optional().isString(),
  body('ageRange').optional().isString(),
  body('gender').optional().isString(),
  body('struggles').optional().isArray(),
  body('preferredFormat').optional().isIn(['1on1', 'group', 'both']),
  body('preferredCommunication').optional().isIn(['video', 'chat', 'both']),
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { location, ageRange, gender, struggles, preferredFormat, preferredCommunication } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        location,
        ageRange,
        gender,
        struggles,
        preferredFormat,
        preferredCommunication,
        profileComplete: true
      },
      select: {
        id: true,
        username: true,
        email: true,
        userRole: true,
        profileComplete: true,
        location: true,
        ageRange: true,
        gender: true,
        struggles: true,
        preferredFormat: true,
        preferredCommunication: true,
        isApproved: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get all users (admin only)
router.get('/', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, approved } = req.query;
    
    const where: any = {};
    if (role) where.userRole = role;
    if (approved !== undefined) where.isApproved = approved === 'true';

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        userRole: true,
        profileComplete: true,
        isApproved: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
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
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Approve user (admin only)
router.patch('/:id/approve', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

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

// Deactivate user (admin only)
router.patch('/:id/deactivate', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
      select: {
        id: true,
        username: true,
        email: true,
        userRole: true,
        isActive: true
      }
    });

    res.json({ user });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

export default router;


