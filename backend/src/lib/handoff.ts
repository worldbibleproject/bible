import { prisma } from './database';
import { sendEmail } from './email';

export interface HandoffRequest {
  mentorId: number;
  seekerId: number;
  reason: string;
  seekerReadiness: 'ready' | 'needs_more_time' | 'not_ready';
  notes?: string;
  recommendedChurches?: number[];
}

export interface ChurchRecommendation {
  churchId: number;
  reason: string;
  compatibilityScore: number;
}

export class HandoffService {
  /**
   * Initiate handoff from mentor to church finder
   */
  async initiateHandoff(request: HandoffRequest): Promise<void> {
    try {
      // Get seeker and mentor details
      const seeker = await prisma.user.findUnique({
        where: { id: request.seekerId },
        include: { seekerProfile: true }
      });

      const mentor = await prisma.user.findUnique({
        where: { id: request.mentorId },
        include: { mentorProfile: true }
      });

      if (!seeker || !mentor) {
        throw new Error('User not found');
      }

      // Create handoff record
      const handoff = await prisma.churchConnection.create({
        data: {
          seekerId: request.seekerId,
          churchId: request.recommendedChurches?.[0] || 1, // Default church
          churchFinderId: 1, // Will be assigned to available church finder
          status: 'PENDING',
          connectionNotes: `Handoff from mentor ${mentor.username}: ${request.reason}. Readiness: ${request.seekerReadiness}. ${request.notes || ''}`
        }
      });

      // Find available church finders
      const churchFinders = await prisma.user.findMany({
        where: {
          userRole: 'CHURCH_FINDER',
          isApproved: true,
          isActive: true
        },
        include: { churchConnections: true }
      });

      // Assign to least busy church finder
      const assignedChurchFinder = churchFinders.reduce((least, current) => {
        const leastConnections = least.churchConnections.filter(c => c.status === 'PENDING').length;
        const currentConnections = current.churchConnections.filter(c => c.status === 'PENDING').length;
        return currentConnections < leastConnections ? current : least;
      });

      // Update handoff with assigned church finder
      await prisma.churchConnection.update({
        where: { id: handoff.id },
        data: { churchFinderId: assignedChurchFinder.id }
      });

      // Generate church recommendations
      const recommendations = await this.generateChurchRecommendations(request.seekerId);

      // Send notification to church finder
      await this.notifyChurchFinder(assignedChurchFinder.id, {
        seekerName: seeker.username,
        mentorName: mentor.username,
        reason: request.reason,
        readiness: request.seekerReadiness,
        notes: request.notes,
        recommendations
      });

      // Send notification to seeker
      await this.notifySeeker(request.seekerId, {
        mentorName: mentor.username,
        message: 'Your mentor has recommended you for church connection. A church finder will contact you soon.'
      });

    } catch (error) {
      console.error('Error initiating handoff:', error);
      throw new Error('Failed to initiate handoff');
    }
  }

  /**
   * Generate church recommendations based on seeker profile
   */
  async generateChurchRecommendations(seekerId: number): Promise<ChurchRecommendation[]> {
    try {
      const seeker = await prisma.user.findUnique({
        where: { id: seekerId },
        include: { seekerProfile: true }
      });

      if (!seeker) {
        throw new Error('Seeker not found');
      }

      const churches = await prisma.church.findMany({
        where: { isVetted: true, isActive: true }
      });

      const recommendations: ChurchRecommendation[] = [];

      for (const church of churches) {
        let compatibilityScore = 0;
        const reasons: string[] = [];

        // Location compatibility
        if (seeker.location && church.city) {
          if (seeker.location.toLowerCase().includes(church.city.toLowerCase())) {
            compatibilityScore += 0.3;
            reasons.push('Same city');
          }
        }

        // Denomination compatibility
        if (seeker.seekerProfile?.churchBackground && church.denomination) {
          if (seeker.seekerProfile.churchBackground.toLowerCase().includes(church.denomination.toLowerCase())) {
            compatibilityScore += 0.2;
            reasons.push('Denomination match');
          }
        }

        // Size preference
        if (church.sizeCategory === 'small' && seeker.seekerProfile?.preferredFormat === '1on1') {
          compatibilityScore += 0.1;
          reasons.push('Small church for personal attention');
        } else if (church.sizeCategory === 'large' && seeker.seekerProfile?.preferredFormat === 'group') {
          compatibilityScore += 0.1;
          reasons.push('Large church for community');
        }

        // Service times compatibility
        if (church.serviceTimes && church.serviceTimes.length > 0) {
          compatibilityScore += 0.1;
          reasons.push('Multiple service times');
        }

        // Specialties match
        if (church.specialties && seeker.seekerProfile?.struggles) {
          const seekerStruggles = Array.isArray(seeker.seekerProfile.struggles) 
            ? seeker.seekerProfile.struggles 
            : [];
          const churchSpecialties = Array.isArray(church.specialties) 
            ? church.specialties 
            : [];

          const matchingSpecialties = seekerStruggles.filter(struggle => 
            churchSpecialties.some(specialty => 
              specialty.toLowerCase().includes(struggle.toLowerCase())
            )
          );

          if (matchingSpecialties.length > 0) {
            compatibilityScore += 0.2;
            reasons.push(`Specialties match: ${matchingSpecialties.join(', ')}`);
          }
        }

        if (compatibilityScore > 0.2) {
          recommendations.push({
            churchId: church.id,
            reason: reasons.join('; '),
            compatibilityScore
          });
        }
      }

      return recommendations.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    } catch (error) {
      console.error('Error generating church recommendations:', error);
      return [];
    }
  }

  /**
   * Notify church finder about new handoff
   */
  private async notifyChurchFinder(churchFinderId: number, data: any): Promise<void> {
    try {
      const churchFinder = await prisma.user.findUnique({
        where: { id: churchFinderId }
      });

      if (!churchFinder) return;

      // Create notification
      await prisma.notification.create({
        data: {
          userId: churchFinderId,
          type: 'CHURCH_CONNECTION',
          title: 'New Seeker Handoff',
          message: `${data.seekerName} has been referred by mentor ${data.mentorName}. Reason: ${data.reason}. Readiness: ${data.readiness}`,
          actionUrl: `/church-finder/connections/${data.seekerId}`
        }
      });

      // Send email notification
      await sendEmail({
        to: churchFinder.email,
        subject: 'New Seeker Handoff - Action Required',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">New Seeker Handoff</h2>
            <p><strong>Seeker:</strong> ${data.seekerName}</p>
            <p><strong>Mentor:</strong> ${data.mentorName}</p>
            <p><strong>Reason:</strong> ${data.reason}</p>
            <p><strong>Readiness:</strong> ${data.readiness}</p>
            ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
            
            <h3>Recommended Churches:</h3>
            <ul>
              ${data.recommendations.map((rec: any) => 
                `<li>Church ID: ${rec.churchId} - ${rec.reason} (Score: ${rec.compatibilityScore})</li>`
              ).join('')}
            </ul>
            
            <a href="${process.env.FRONTEND_URL}/church-finder/connections" 
               style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
              Review Handoff
            </a>
          </div>
        `
      });
    } catch (error) {
      console.error('Error notifying church finder:', error);
    }
  }

  /**
   * Notify seeker about handoff
   */
  private async notifySeeker(seekerId: number, data: any): Promise<void> {
    try {
      const seeker = await prisma.user.findUnique({
        where: { id: seekerId }
      });

      if (!seeker) return;

      // Create notification
      await prisma.notification.create({
        data: {
          userId: seekerId,
          type: 'CHURCH_CONNECTION',
          title: 'Church Connection Initiated',
          message: data.message,
          actionUrl: '/seeker/church-connections'
        }
      });

      // Send email notification
      await sendEmail({
        to: seeker.email,
        subject: 'Church Connection Initiated',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Church Connection Initiated</h2>
            <p>Hello ${seeker.username},</p>
            <p>Your mentor ${data.mentorName} has recommended you for church connection.</p>
            <p>A church finder will contact you soon to help you find the right church community.</p>
            
            <a href="${process.env.FRONTEND_URL}/seeker/church-connections" 
               style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
              View Connections
            </a>
          </div>
        `
      });
    } catch (error) {
      console.error('Error notifying seeker:', error);
    }
  }

  /**
   * Get handoff history for a seeker
   */
  async getHandoffHistory(seekerId: number): Promise<any[]> {
    try {
      return await prisma.churchConnection.findMany({
        where: { seekerId },
        include: {
          church: true,
          churchFinder: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error('Error getting handoff history:', error);
      return [];
    }
  }

  /**
   * Update handoff status
   */
  async updateHandoffStatus(connectionId: number, status: string, notes?: string): Promise<void> {
    try {
      await prisma.churchConnection.update({
        where: { id: connectionId },
        data: {
          status: status as any,
          connectionNotes: notes
        }
      });
    } catch (error) {
      console.error('Error updating handoff status:', error);
      throw new Error('Failed to update handoff status');
    }
  }
}

export default HandoffService;
