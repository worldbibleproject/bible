export type UserRole = 'SEEKER' | 'DISCIPLE_MAKER' | 'CHURCH_FINDER' | 'ADMIN';

export type SessionType = 'ONE_ON_ONE' | 'GROUP';

export type SessionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type ParticipantStatus = 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'ATTENDED' | 'NO_SHOW';

export type ConnectionStatus = 'PENDING' | 'CONTACTED' | 'VISITED' | 'JOINED' | 'DECLINED';

export type MessageType = 'TEXT' | 'VIDEO_CALL' | 'FILE';

export type NotificationType = 'SESSION_BOOKING' | 'MENTOR_MATCH' | 'CHURCH_CONNECTION' | 'MESSAGE' | 'SYSTEM';

export interface User {
  id: number;
  username: string;
  email: string;
  userRole: UserRole;
  profileComplete: boolean;
  location?: string;
  ageRange?: string;
  gender?: string;
  struggles?: string[];
  preferredFormat?: string;
  preferredCommunication?: string;
  isApproved: boolean;
  approvalDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SeekerProfile {
  id: number;
  userId: number;
  maritalStatus?: string;
  struggles?: string[];
  currentSituation?: string;
  helpNeeded?: string;
  faithLevel?: string;
  churchBackground?: string;
  spiritualJourney?: string;
  faithQuestions?: string;
  preferredFormat?: string;
  preferredCommunication?: string;
  mentorGenderPreference?: string;
  mentorAgePreference?: string;
  sessionFrequency?: string;
  groupInterests?: string[];
  mentoringGoals?: string;
  mentorExpectations?: string;
  commitmentLevel?: string;
  aiResponse?: any;
  createdAt: string;
  updatedAt: string;
}

export interface MentorProfile {
  id: number;
  userId: number;
  testimony?: string;
  yearsChristian?: string;
  denomination?: string;
  traumas?: string[];
  healingStory?: string;
  keyScriptures?: string;
  specialties?: string[];
  additionalExpertise?: string;
  maxMentees: number;
  currentMentees: number;
  sessionTypes?: string;
  communicationPreference?: string;
  sessionDuration: number;
  mentoringPhilosophy?: string;
  groupTopics?: string[];
  groupDescription?: string;
  availabilitySchedule?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Session {
  id: number;
  mentorId: number;
  sessionType: SessionType;
  topic?: string;
  title?: string;
  description?: string;
  scheduledTime?: string;
  durationMinutes: number;
  maxParticipants: number;
  currentParticipants: number;
  status: SessionStatus;
  meetingLink?: string;
  notes?: string;
  createdAt: string;
  mentor?: User;
  participants?: SessionParticipant[];
  messages?: Message[];
}

export interface SessionParticipant {
  id: number;
  sessionId: number;
  seekerId: number;
  status: ParticipantStatus;
  joinedAt?: string;
  leftAt?: string;
  feedback?: string;
  createdAt: string;
  seeker?: User;
}

export interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  sessionId?: number;
  messageType: MessageType;
  content?: string;
  filePath?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  sender?: User;
  recipient?: User;
}

export interface Church {
  id: number;
  name: string;
  denomination?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  pastorName?: string;
  serviceTimes?: any;
  description?: string;
  specialties?: string[];
  sizeCategory?: string;
  isVetted: boolean;
  vettedBy?: number;
  vettedDate?: string;
  isActive: boolean;
  createdAt: string;
  vettedByUser?: User;
}

export interface ChurchConnection {
  id: number;
  seekerId: number;
  churchId: number;
  churchFinderId: number;
  status: ConnectionStatus;
  connectionNotes?: string;
  contactInfoShared: boolean;
  sharedAt?: string;
  createdAt: string;
  church?: Church;
  seeker?: User;
}

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface MentorRelationship {
  id: number;
  mentorId: number;
  seekerId: number;
  status: string;
  matchScore?: number;
  startedAt?: string;
  endedAt?: string;
  notes?: string;
  createdAt: string;
  mentor?: MentorProfile;
  seeker?: SeekerProfile;
}

export interface WizardData {
  id: number;
  userId: number;
  userInput?: any;
  referencesJson?: string;
  prayerText?: string;
  versesJson?: string;
  createdAt: string;
}

export interface BibleReference {
  book: number;
  chapterStart: number;
  chapterEnd: number;
  reason: string;
  bookName?: string;
  text?: string;
}

export interface BibleVerse {
  book: number;
  chapter: number;
  verse: number;
  reference: string;
  text: string;
  commentary: string;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
  inviteToken?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface SocketContextType {
  socket: any;
  isConnected: boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendTyping: (conversationId: string, isTyping: boolean) => void;
  onTyping: (callback: (data: any) => void) => void;
  offTyping: (callback: (data: any) => void) => void;
}


