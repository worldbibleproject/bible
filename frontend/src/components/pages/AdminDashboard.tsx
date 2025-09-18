'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AdminStats {
  users: {
    total: number;
    seekers: number;
    mentors: number;
    churchFinders: number;
    pendingApprovals: number;
  };
  sessions: {
    total: number;
    completed: number;
  };
  churches: {
    total: number;
    vetted: number;
  };
  engagement: {
    messages: number;
    connections: number;
  };
}

interface PendingUser {
  id: number;
  username: string;
  email: string;
  userRole: string;
  createdAt: string;
  isApproved: boolean;
}

interface Invitation {
  id: number;
  email: string;
  name: string;
  role: string;
  used: boolean;
  expiresAt: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    role: 'DISCIPLE_MAKER'
  });

  useEffect(() => {
    if (user?.userRole === 'ADMIN') {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes, invitationsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/pending-approvals'),
        api.get('/admin/invitations')
      ]);

      setStats(statsRes.data);
      setPendingUsers(pendingRes.data.users);
      setInvitations(invitationsRes.data.invitations);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: number, approved: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/approve`, { approved });
      await loadDashboardData();
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/invite', inviteForm);
      setInviteForm({ email: '', name: '', role: 'DISCIPLE_MAKER' });
      await loadDashboardData();
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  };

  if (user?.userRole !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage users, invitations, and system overview</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'users', name: 'User Management' },
              { id: 'invitations', name: 'Invitations' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">U</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.users.total}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">S</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Seekers</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.users.seekers}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">M</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Mentors</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.users.mentors}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">C</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Church Finders</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.users.churchFinders}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Sessions</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Total</span>
                      <span className="text-sm font-medium">{stats.sessions.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Completed</span>
                      <span className="text-sm font-medium">{stats.sessions.completed}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Churches</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Total</span>
                      <span className="text-sm font-medium">{stats.churches.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Vetted</span>
                      <span className="text-sm font-medium">{stats.churches.vetted}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Messages</span>
                      <span className="text-sm font-medium">{stats.engagement.messages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Connections</span>
                      <span className="text-sm font-medium">{stats.engagement.connections}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Approvals</h3>
                {pendingUsers.length === 0 ? (
                  <p className="text-gray-500">No pending approvals</p>
                ) : (
                  <div className="space-y-4">
                    {pendingUsers.map((user) => (
                      <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{user.username}</h4>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-sm text-gray-500">Role: {user.userRole}</p>
                            <p className="text-sm text-gray-500">
                              Joined: {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleApproveUser(user.id, true)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleApproveUser(user.id, false)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Invitations Tab */}
        {activeTab === 'invitations' && (
          <div className="space-y-6">
            {/* Send Invitation Form */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Send Invitation</h3>
                <form onSubmit={handleSendInvitation} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        required
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        required
                        value={inviteForm.name}
                        onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <select
                        value={inviteForm.role}
                        onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="DISCIPLE_MAKER">Mentor</option>
                        <option value="CHURCH_FINDER">Church Finder</option>
                      </select>
                    </div>
                  </div>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Send Invitation
                  </Button>
                </form>
              </div>
            </div>

            {/* Invitations List */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Invitations</h3>
                {invitations.length === 0 ? (
                  <p className="text-gray-500">No invitations sent</p>
                ) : (
                  <div className="space-y-4">
                    {invitations.map((invitation) => (
                      <div key={invitation.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{invitation.name}</h4>
                            <p className="text-sm text-gray-500">{invitation.email}</p>
                            <p className="text-sm text-gray-500">Role: {invitation.role}</p>
                            <p className="text-sm text-gray-500">
                              Sent: {new Date(invitation.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                invitation.used
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {invitation.used ? 'Used' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


