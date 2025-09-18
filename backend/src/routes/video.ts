import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ZoomService } from '../lib/zoom';
import { SchedulingService } from '../lib/scheduling';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Initialize services
const zoomService = new ZoomService(
  process.env.ZOOM_API_KEY || '',
  process.env.ZOOM_API_SECRET || ''
);
const schedulingService = new SchedulingService(prisma, zoomService);

/**
 * Create a new video meeting
 */
router.post('/create-meeting', authenticate, async (req, res) => {
  try {
    const { topic, startTime, duration = 60 } = req.body;
    const userId = (req as any).user.id;

    // Create Zoom meeting
    const meeting = await zoomService.createMeeting(
      topic || 'Mentorship Session',
      startTime ? new Date(startTime) : undefined,
      duration
    );

    // Store meeting in database
    const dbMeeting = await prisma.videoMeeting.create({
      data: {
        meetingId: meeting.meeting_number,
        topic: meeting.topic,
        startTime: new Date(meeting.start_time),
        duration: meeting.duration,
        joinUrl: meeting.join_url,
        password: meeting.password,
        createdBy: userId,
        status: 'scheduled'
      }
    });

    res.json({
      success: true,
      meeting: {
        id: dbMeeting.id,
        meetingId: dbMeeting.meetingId,
        topic: dbMeeting.topic,
        startTime: dbMeeting.startTime,
        duration: dbMeeting.duration,
        joinUrl: dbMeeting.joinUrl,
        password: dbMeeting.password,
        status: dbMeeting.status
      }
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create meeting'
    });
  }
});

/**
 * Get user's meetings
 */
router.get('/meetings', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { status, limit = 10, offset = 0 } = req.query;

    const whereClause: any = { createdBy: userId };
    if (status) {
      whereClause.status = status;
    }

    const meetings = await prisma.videoMeeting.findMany({
      where: whereClause,
      orderBy: { startTime: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    res.json({
      success: true,
      meetings: meetings.map(meeting => ({
        id: meeting.id,
        meetingId: meeting.meetingId,
        topic: meeting.topic,
        startTime: meeting.startTime,
        duration: meeting.duration,
        joinUrl: meeting.joinUrl,
        password: meeting.password,
        status: meeting.status,
        createdAt: meeting.createdAt
      }))
    });
  } catch (error) {
    console.error('Error getting meetings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get meetings'
    });
  }
});

/**
 * Join a meeting
 */
router.post('/join-meeting', authenticate, async (req, res) => {
  try {
    const { meetingId } = req.body;
    const userId = (req as any).user.id;

    // Get meeting details
    const meeting = await prisma.videoMeeting.findFirst({
      where: { meetingId }
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate signature for client-side SDK
    const signature = zoomService.generateSignature(meetingId, 0); // 0 = participant

    res.json({
      success: true,
      meeting: {
        id: meeting.id,
        meetingId: meeting.meetingId,
        topic: meeting.topic,
        joinUrl: meeting.joinUrl,
        password: meeting.password,
        signature,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email
      }
    });
  } catch (error) {
    console.error('Error joining meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join meeting'
    });
  }
});

/**
 * End a meeting
 */
router.post('/end-meeting/:meetingId', authenticate, async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = (req as any).user.id;

    // Update meeting status
    const meeting = await prisma.videoMeeting.updateMany({
      where: {
        meetingId,
        createdBy: userId
      },
      data: {
        status: 'ended',
        endedAt: new Date()
      }
    });

    if (meeting.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found or unauthorized'
      });
    }

    res.json({
      success: true,
      message: 'Meeting ended successfully'
    });
  } catch (error) {
    console.error('Error ending meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end meeting'
    });
  }
});

/**
 * Delete a meeting
 */
router.delete('/meetings/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const meeting = await prisma.videoMeeting.findUnique({
      where: { id: parseInt(id) }
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }

    if (meeting.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to delete this meeting'
      });
    }

    // Delete from Zoom
    await zoomService.deleteMeeting(meeting.meetingId);

    // Delete from database
    await prisma.videoMeeting.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Meeting deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete meeting'
    });
  }
});

/**
 * Get meeting participants
 */
router.get('/meetings/:id/participants', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const meeting = await prisma.videoMeeting.findUnique({
      where: { id: parseInt(id) },
      include: {
        createdByUser: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }

    // Check if user has access to this meeting
    if (meeting.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to view participants'
      });
    }

    res.json({
      success: true,
      participants: [
        {
          id: meeting.createdByUser.id,
          name: `${meeting.createdByUser.firstName} ${meeting.createdByUser.lastName}`,
          email: meeting.createdByUser.email,
          role: 'host'
        }
      ]
    });
  } catch (error) {
    console.error('Error getting participants:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get participants'
    });
  }
});

/**
 * Get meeting analytics
 */
router.get('/meetings/:id/analytics', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const meeting = await prisma.videoMeeting.findUnique({
      where: { id: parseInt(id) }
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }

    if (meeting.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to view analytics'
      });
    }

    // Mock analytics data - replace with actual Zoom API calls
    const analytics = {
      duration: meeting.duration,
      participants: 2,
      startTime: meeting.startTime,
      endTime: meeting.endedAt,
      status: meeting.status
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics'
    });
  }
});

export default router;
