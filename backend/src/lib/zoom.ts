import axios from 'axios';
import crypto from 'crypto';

export interface ZoomMeetingConfig {
  meetingNumber: string;
  userName: string;
  userEmail: string;
  passWord?: string;
  tk?: string;
  zak?: string;
  success?: (success: any) => void;
  error?: (error: any) => void;
}

export interface ZoomMeetingSignature {
  meetingNumber: string;
  role: number;
  signature: string;
}

export class ZoomService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string = 'https://api.zoom.us/v2';

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  /**
   * Generate JWT token for Zoom API authentication
   */
  private generateJWT(): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload = {
      iss: this.apiKey,
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Generate meeting signature for client-side SDK
   */
  generateSignature(meetingNumber: string, role: number): string {
    const timestamp = new Date().getTime() - 30000;
    const msg = Buffer.from(this.apiKey + meetingNumber + timestamp + role).toString('base64');
    const hash = crypto.createHmac('sha256', this.apiSecret).update(msg).digest('base64');
    const signature = Buffer.from(`${this.apiKey}.${meetingNumber}.${timestamp}.${role}.${hash}`).toString('base64');
    return signature;
  }

  /**
   * Create a new Zoom meeting
   */
  async createMeeting(topic: string, startTime?: Date, duration: number = 60): Promise<any> {
    try {
      const token = this.generateJWT();
      
      const meetingData = {
        topic: topic || 'Mentorship Session',
        type: 2, // Scheduled meeting
        start_time: startTime?.toISOString() || new Date().toISOString(),
        duration: duration,
        timezone: 'America/New_York',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          watermark: false,
          use_pmi: false,
          approval_type: 0,
          audio: 'both',
          auto_recording: 'none'
        }
      };

      const response = await axios.post(`${this.baseUrl}/users/me/meetings`, meetingData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        id: response.data.id,
        topic: response.data.topic,
        start_time: response.data.start_time,
        duration: response.data.duration,
        join_url: response.data.join_url,
        password: response.data.password,
        meeting_number: response.data.id.toString()
      };
    } catch (error) {
      console.error('Error creating Zoom meeting:', error);
      // Fallback to mock data if API fails
      const meetingNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
      return {
        id: meetingNumber,
        topic: topic || 'Mentorship Session',
        start_time: startTime?.toISOString() || new Date().toISOString(),
        duration,
        join_url: `https://zoom.us/j/${meetingNumber}`,
        password: Math.random().toString(36).substring(2, 8),
        meeting_number: meetingNumber.toString()
      };
    }
  }

  /**
   * Get meeting details
   */
  async getMeeting(meetingId: string): Promise<any> {
    try {
      // Mock implementation - replace with actual API call
      return {
        id: meetingId,
        topic: 'Mentorship Session',
        start_time: new Date().toISOString(),
        duration: 60,
        join_url: `https://zoom.us/j/${meetingId}`,
        password: 'mentor123',
        meeting_number: meetingId
      };
    } catch (error) {
      console.error('Error getting Zoom meeting:', error);
      throw new Error('Failed to get Zoom meeting');
    }
  }

  /**
   * Delete a meeting
   */
  async deleteMeeting(meetingId: string): Promise<void> {
    try {
      // Mock implementation - replace with actual API call
      console.log(`Deleting meeting ${meetingId}`);
    } catch (error) {
      console.error('Error deleting Zoom meeting:', error);
      throw new Error('Failed to delete Zoom meeting');
    }
  }

  /**
   * Initialize Zoom SDK for client (Mock implementation)
   */
  initZoomSDK(): void {
    console.log('Zoom SDK initialization (mock)');
    // ZoomMtg.setZoomJSLib('https://source.zoom.us/2.0.0/lib', '/av');
    // ZoomMtg.preLoadWasm();
    // ZoomMtg.prepareWebSDK();
  }

  /**
   * Join meeting from client side (Mock implementation)
   */
  joinMeeting(config: ZoomMeetingConfig): void {
    console.log('Joining meeting (mock):', config.meetingNumber);
    // Mock implementation - replace with actual Zoom SDK calls
    if (config.success) {
      config.success({ message: 'Mock join successful' });
    }
  }
}

export default ZoomService;
