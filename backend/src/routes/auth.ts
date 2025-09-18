import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/database';
import { hashPassword, verifyPassword, generateToken } from '../lib/auth';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { sendEmail } from '../lib/email';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Register
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['SEEKER', 'DISCIPLE_MAKER', 'CHURCH_FINDER']).withMessage('Invalid role'),
  body('inviteToken').optional().isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role = 'SEEKER', inviteToken } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Validate invite token for mentors and church finders
    if (['DISCIPLE_MAKER', 'CHURCH_FINDER'].includes(role)) {
      if (!inviteToken) {
        return res.status(400).json({ error: 'Invitation token required for this role' });
      }

      const invitation = await prisma.userInvitation.findFirst({
        where: {
          token: inviteToken,
          used: false,
          expiresAt: { gt: new Date() }
        }
      });

      if (!invitation) {
        return res.status(400).json({ error: 'Invalid or expired invitation' });
      }

      // Mark invitation as used
      await prisma.userInvitation.update({
        where: { id: invitation.id },
        data: { used: true }
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        userRole: role,
        isApproved: role === 'SEEKER' // Seekers are auto-approved
      },
      select: {
        id: true,
        username: true,
        email: true,
        userRole: true,
        isApproved: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.userRole
    });

    res.status(201).json({
      message: 'User created successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        userRole: true,
        isActive: true,
        isApproved: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.userRole
    });

    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
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
        approvalDate: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, username: true }
    });

    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token (you might want to create a separate table for this)
    // For now, we'll use a simple approach
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // You might want to add resetToken and resetExpires fields to your User model
      }
    });

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.username},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });

    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Reset password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    // Verify token and get user
    // You'll need to implement token verification logic here
    // For now, this is a placeholder

    const passwordHash = await hashPassword(password);

    // Update password
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: { passwordHash }
    // });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;


