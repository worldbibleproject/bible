import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, JWTPayload } from '../lib/auth';
import { prisma } from '../lib/database';
import { UserRole } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const payload = verifyToken(token);
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, userRole: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.userRole
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const requireApproval = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check if user needs approval (mentors and church finders)
  if (['DISCIPLE_MAKER', 'CHURCH_FINDER'].includes(req.user.role)) {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { isApproved: true }
    });

    if (!user?.isApproved) {
      return res.status(403).json({ 
        error: 'Account pending approval',
        message: 'Your account is pending admin approval. Please wait for approval before accessing this feature.'
      });
    }
  }

  next();
};


