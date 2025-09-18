import { PrismaClient } from '@prisma/client';
import ical from 'ical-generator';
import { ZoomService } from './zoom';

export interface AvailabilitySlot {
  id?: number;
  mentorId: number;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
}

export interface SessionBooking {
  id?: number;
  mentorId: number;
  seekerId: number;
  scheduledTime: Date;
  duration: number; // in minutes
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  meetingId?: string;
  notes?: string;
}

export class SchedulingService {
  private prisma: PrismaClient;
  private zoomService: ZoomService;

  constructor(prisma: PrismaClient, zoomService: ZoomService) {
    this.prisma = prisma;
    this.zoomService = zoomService;
  }

  /**
   * Set mentor availability
   */
  async setAvailability(mentorId: number, slots: AvailabilitySlot[]): Promise<void> {
    try {
      // Delete existing availability
      await this.prisma.availability.deleteMany({
        where: { mentorId }
      });

      // Create new availability slots
      await this.prisma.availability.createMany({
        data: slots.map(slot => ({
          mentorId: slot.mentorId,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable
        }))
      });
    } catch (error) {
      console.error('Error setting availability:', error);
      throw new Error('Failed to set availability');
    }
  }

  /**
   * Get mentor availability
   */
  async getAvailability(mentorId: number): Promise<AvailabilitySlot[]> {
    try {
      const availability = await this.prisma.availability.findMany({
        where: { mentorId }
      });

      return availability.map(slot => ({
        id: slot.id,
        mentorId: slot.mentorId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable
      }));
    } catch (error) {
      console.error('Error getting availability:', error);
      throw new Error('Failed to get availability');
    }
  }

  /**
   * Check if mentor is available at specific time
   */
  async isMentorAvailable(mentorId: number, dateTime: Date): Promise<boolean> {
    try {
      const dayOfWeek = dateTime.getDay();
      const timeString = dateTime.toTimeString().substring(0, 5); // HH:MM

      const availability = await this.prisma.availability.findFirst({
        where: {
          mentorId,
          dayOfWeek,
          isAvailable: true,
          startTime: { lte: timeString },
          endTime: { gte: timeString }
        }
      });

      return !!availability;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  }

  /**
   * Book a session
   */
  async bookSession(booking: SessionBooking): Promise<SessionBooking> {
    try {
      // Check if mentor is available
      const isAvailable = await this.isMentorAvailable(booking.mentorId, booking.scheduledTime);
      if (!isAvailable) {
        throw new Error('Mentor is not available at the requested time');
      }

      // Create Zoom meeting
      const meeting = await this.zoomService.createMeeting(
        `Mentorship Session - ${booking.scheduledTime.toDateString()}`,
        booking.scheduledTime,
        booking.duration
      );

      // Create session booking
      const session = await this.prisma.session.create({
        data: {
          mentorId: booking.mentorId,
          seekerId: booking.seekerId,
          scheduledTime: booking.scheduledTime,
          duration: booking.duration,
          status: booking.status,
          meetingId: meeting.meeting_number,
          notes: booking.notes
        }
      });

      return {
        id: session.id,
        mentorId: session.mentorId,
        seekerId: session.seekerId,
        scheduledTime: session.scheduledTime,
        duration: session.duration,
        status: session.status as any,
        meetingId: session.meetingId,
        notes: session.notes
      };
    } catch (error) {
      console.error('Error booking session:', error);
      throw new Error('Failed to book session');
    }
  }

  /**
   * Get user's sessions
   */
  async getUserSessions(userId: number, userRole: 'mentor' | 'seeker'): Promise<SessionBooking[]> {
    try {
      const whereClause = userRole === 'mentor' 
        ? { mentorId: userId }
        : { seekerId: userId };

      const sessions = await this.prisma.session.findMany({
        where: whereClause,
        include: {
          mentor: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          seeker: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        },
        orderBy: { scheduledTime: 'desc' }
      });

      return sessions.map(session => ({
        id: session.id,
        mentorId: session.mentorId,
        seekerId: session.seekerId,
        scheduledTime: session.scheduledTime,
        duration: session.duration,
        status: session.status as any,
        meetingId: session.meetingId,
        notes: session.notes
      }));
    } catch (error) {
      console.error('Error getting user sessions:', error);
      throw new Error('Failed to get sessions');
    }
  }

  /**
   * Update session status
   */
  async updateSessionStatus(sessionId: number, status: string): Promise<void> {
    try {
      await this.prisma.session.update({
        where: { id: sessionId },
        data: { status }
      });
    } catch (error) {
      console.error('Error updating session status:', error);
      throw new Error('Failed to update session status');
    }
  }

  /**
   * Cancel a session
   */
  async cancelSession(sessionId: number): Promise<void> {
    try {
      const session = await this.prisma.session.findUnique({
        where: { id: sessionId }
      });

      if (!session) {
        throw new Error('Session not found');
      }

      // Delete Zoom meeting if it exists
      if (session.meetingId) {
        await this.zoomService.deleteMeeting(session.meetingId);
      }

      // Update session status
      await this.updateSessionStatus(sessionId, 'cancelled');
    } catch (error) {
      console.error('Error cancelling session:', error);
      throw new Error('Failed to cancel session');
    }
  }

  /**
   * Generate calendar invite
   */
  async generateCalendarInvite(sessionId: number): Promise<string> {
    try {
      const session = await this.prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          mentor: true,
          seeker: true
        }
      });

      if (!session) {
        throw new Error('Session not found');
      }

      const calendar = ical({
        name: 'Mentorship Session',
        timezone: 'America/New_York'
      });

      const event = calendar.createEvent({
        start: session.scheduledTime,
        end: new Date(session.scheduledTime.getTime() + session.duration * 60000),
        summary: 'Mentorship Session',
        description: `Mentorship session between ${session.mentor.firstName} ${session.mentor.lastName} and ${session.seeker.firstName} ${session.seeker.lastName}`,
        location: 'Online - Zoom Meeting',
        url: session.meetingId ? `https://zoom.us/j/${session.meetingId}` : undefined
      });

      return calendar.toString();
    } catch (error) {
      console.error('Error generating calendar invite:', error);
      throw new Error('Failed to generate calendar invite');
    }
  }

  /**
   * Get available time slots for a mentor on a specific date
   */
  async getAvailableSlots(mentorId: number, date: Date): Promise<string[]> {
    try {
      const dayOfWeek = date.getDay();
      const availability = await this.prisma.availability.findMany({
        where: {
          mentorId,
          dayOfWeek,
          isAvailable: true
        }
      });

      // Get existing bookings for the day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const existingBookings = await this.prisma.session.findMany({
        where: {
          mentorId,
          scheduledTime: {
            gte: startOfDay,
            lte: endOfDay
          },
          status: { not: 'cancelled' }
        }
      });

      // Generate available time slots
      const slots: string[] = [];
      
      for (const slot of availability) {
        const startTime = new Date(date);
        const [startHour, startMin] = slot.startTime.split(':').map(Number);
        startTime.setHours(startHour, startMin, 0, 0);

        const endTime = new Date(date);
        const [endHour, endMin] = slot.endTime.split(':').map(Number);
        endTime.setHours(endHour, endMin, 0, 0);

        // Generate 30-minute slots
        const currentTime = new Date(startTime);
        while (currentTime < endTime) {
          const slotTime = currentTime.toTimeString().substring(0, 5);
          
          // Check if slot is already booked
          const isBooked = existingBookings.some(booking => {
            const bookingTime = new Date(booking.scheduledTime);
            return bookingTime.toTimeString().substring(0, 5) === slotTime;
          });

          if (!isBooked && currentTime > new Date()) {
            slots.push(slotTime);
          }

          currentTime.setMinutes(currentTime.getMinutes() + 30);
        }
      }

      return slots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      throw new Error('Failed to get available slots');
    }
  }
}

export default SchedulingService;
