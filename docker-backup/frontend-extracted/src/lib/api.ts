import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  private clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  public setAuthToken(token: string): void {
    this.setToken(token);
  }

  public clearAuthToken(): void {
    this.clearToken();
  }

  // Generic request methods
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Auth endpoints
  public async login(credentials: { email: string; password: string }) {
    const response = await this.post('/api/auth/login', credentials);
    if (response.data?.token) {
      this.setAuthToken(response.data.token);
    }
    return response;
  }

  public async register(data: any) {
    const response = await this.post('/api/auth/register', data);
    if (response.data?.token) {
      this.setAuthToken(response.data.token);
    }
    return response;
  }

  public async getCurrentUser() {
    return this.get('/api/auth/me');
  }

  public async forgotPassword(email: string) {
    return this.post('/api/auth/forgot-password', { email });
  }

  public async resetPassword(token: string, password: string) {
    return this.post('/api/auth/reset-password', { token, password });
  }

  // User endpoints
  public async getUserProfile() {
    return this.get('/api/users/profile');
  }

  public async updateUserProfile(data: any) {
    return this.put('/api/users/profile', data);
  }

  // Wizard endpoints
  public async processWizard(data: any) {
    return this.post('/api/wizard/process', data);
  }

  public async getWizardData() {
    return this.get('/api/wizard/my-data');
  }

  // Seeker endpoints
  public async getSeekerProfile() {
    return this.get('/api/seekers/profile');
  }

  public async updateSeekerProfile(data: any) {
    return this.post('/api/seekers/profile', data);
  }

  public async getMentors(params?: any) {
    return this.get('/api/seekers/mentors', { params });
  }

  public async getMentorDetails(id: number) {
    return this.get(`/api/seekers/mentors/${id}`);
  }

  public async requestMentorRelationship(mentorId: number, message?: string) {
    return this.post(`/api/seekers/mentors/${mentorId}/request`, { message });
  }

  public async getMentorRelationships() {
    return this.get('/api/seekers/mentor-relationships');
  }

  public async getGroupSessions(params?: any) {
    return this.get('/api/seekers/group-sessions', { params });
  }

  public async joinGroupSession(sessionId: number) {
    return this.post(`/api/seekers/group-sessions/${sessionId}/join`);
  }

  // Mentor endpoints
  public async getMentorProfile() {
    return this.get('/api/mentors/profile');
  }

  public async updateMentorProfile(data: any) {
    return this.post('/api/mentors/profile', data);
  }

  public async getMentees() {
    return this.get('/api/mentors/mentees');
  }

  public async updateMentorRelationship(relationshipId: number, data: any) {
    return this.patch(`/api/mentors/mentees/${relationshipId}/status`, data);
  }

  public async createGroupSession(data: any) {
    return this.post('/api/mentors/group-sessions', data);
  }

  public async getMentorGroupSessions(params?: any) {
    return this.get('/api/mentors/group-sessions', { params });
  }

  public async getMentorSessions(params?: any) {
    return this.get('/api/mentors/sessions', { params });
  }

  // Church endpoints
  public async getChurches(params?: any) {
    return this.get('/api/churches', { params });
  }

  public async getChurchDetails(id: number) {
    return this.get(`/api/churches/${id}`);
  }

  public async createChurch(data: any) {
    return this.post('/api/churches', data);
  }

  public async updateChurch(id: number, data: any) {
    return this.put(`/api/churches/${id}`, data);
  }

  public async getMyChurches(params?: any) {
    return this.get('/api/churches/my-churches', { params });
  }

  public async getAvailableSeekers(params?: any) {
    return this.get('/api/churches/seekers/available', { params });
  }

  public async createChurchConnection(churchId: number, seekerId: number, notes?: string) {
    return this.post(`/api/churches/${churchId}/connect/${seekerId}`, { connectionNotes: notes });
  }

  public async getChurchConnections(params?: any) {
    return this.get('/api/churches/connections', { params });
  }

  // Session endpoints
  public async getSessions(params?: any) {
    return this.get('/api/sessions', { params });
  }

  public async getSessionDetails(id: number) {
    return this.get(`/api/sessions/${id}`);
  }

  public async updateSessionStatus(id: number, status: string, notes?: string) {
    return this.patch(`/api/sessions/${id}/status`, { status, notes });
  }

  public async updateParticipantStatus(sessionId: number, participantId: number, status: string, feedback?: string) {
    return this.patch(`/api/sessions/${sessionId}/participants/${participantId}`, { status, feedback });
  }

  public async getSessionStats() {
    return this.get('/api/sessions/stats/overview');
  }

  // Message endpoints
  public async getConversation(userId: number, params?: any) {
    return this.get(`/api/messages/conversation/${userId}`, { params });
  }

  public async sendMessage(data: any) {
    return this.post('/api/messages/send', data);
  }

  public async markMessageAsRead(id: number) {
    return this.patch(`/api/messages/${id}/read`);
  }

  public async getUnreadCount() {
    return this.get('/api/messages/unread-count');
  }

  public async getConversations() {
    return this.get('/api/messages/conversations');
  }

  public async deleteMessage(id: number) {
    return this.delete(`/api/messages/${id}`);
  }

  // Admin endpoints
  public async getAdminStats() {
    return this.get('/api/admin/stats');
  }

  public async getPendingApprovals(params?: any) {
    return this.get('/api/admin/pending-approvals', { params });
  }

  public async approveUser(id: number, approved: boolean, notes?: string) {
    return this.patch(`/api/admin/users/${id}/approve`, { approved, notes });
  }

  public async inviteUser(data: any) {
    return this.post('/api/admin/invite', data);
  }

  public async getInvitations(params?: any) {
    return this.get('/api/admin/invitations', { params });
  }

  public async getUserActivity(id: number) {
    return this.get(`/api/admin/users/${id}/activity`);
  }
}

export const apiClient = new ApiClient();
export const api = apiClient;


