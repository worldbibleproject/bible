'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface GroupSession {
  id: number;
  topic: string;
  description: string;
  frequency: string;
  maxParticipants: number;
  duration: number;
  mentorId: number;
  isActive: boolean;
  createdAt: string;
  participants: GroupParticipant[];
}

interface GroupParticipant {
  id: number;
  userId: number;
  user: {
    username: string;
    email: string;
  };
  status: 'invited' | 'accepted' | 'declined' | 'attended' | 'no_show';
  joinedAt: string;
}

export default function GroupSessionManagement() {
  const { user } = useAuth();
  const [groupSessions, setGroupSessions] = useState<GroupSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-groups');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSession, setNewSession] = useState({
    topic: '',
    description: '',
    frequency: 'weekly',
    maxParticipants: 10,
    duration: 90,
    schedule: {
      day: 'monday',
      time: '19:00'
    }
  });

  useEffect(() => {
    if (user?.userRole === 'DISCIPLE_MAKER') {
      loadGroupSessions();
    }
  }, [user]);

  const loadGroupSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/mentors/group-sessions');
      setGroupSessions(response.data.sessions);
    } catch (error) {
      console.error('Error loading group sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGroupSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/mentors/group-sessions', newSession);
      setNewSession({
        topic: '',
        description: '',
        frequency: 'weekly',
        maxParticipants: 10,
        duration: 90,
        schedule: {
          day: 'monday',
          time: '19:00'
        }
      });
      setShowCreateForm(false);
      await loadGroupSessions();
    } catch (error) {
      console.error('Error creating group session:', error);
    }
  };

  const toggleSessionStatus = async (sessionId: number, isActive: boolean) => {
    try {
      await api.patch(`/mentors/group-sessions/${sessionId}`, { isActive });
      await loadGroupSessions();
    } catch (error) {
      console.error('Error updating session status:', error);
    }
  };

  const inviteSeekers = async (sessionId: number) => {
    try {
      await api.post(`/mentors/group-sessions/${sessionId}/invite-seekers`);
      alert('Invitations sent to compatible seekers!');
    } catch (error) {
      console.error('Error inviting seekers:', error);
    }
  };

  if (user?.userRole !== 'DISCIPLE_MAKER') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need mentor privileges to access this page.</p>
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Group Session Management</h1>
              <p className="mt-2 text-gray-600">Create and manage targeted group sessions for seekers</p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Group Session
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'my-groups', name: 'My Group Sessions' },
              { id: 'all-groups', name: 'All Available Groups' },
              { id: 'participants', name: 'Participants' }
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

        {/* Create Group Session Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create Group Session</h3>
                <form onSubmit={createGroupSession} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topic *
                    </label>
                    <input
                      type="text"
                      required
                      value={newSession.topic}
                      onChange={(e) => setNewSession(prev => ({ ...prev, topic: e.target.value }))}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Porn Addiction Recovery"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      value={newSession.description}
                      onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe what this group covers and who it's for..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frequency
                      </label>
                      <select
                        value={newSession.frequency}
                        onChange={(e) => setNewSession(prev => ({ ...prev, frequency: e.target.value }))}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="bi-weekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Participants
                      </label>
                      <input
                        type="number"
                        value={newSession.maxParticipants}
                        onChange={(e) => setNewSession(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        min="2"
                        max="20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (minutes)
                      </label>
                      <select
                        value={newSession.duration}
                        onChange={(e) => setNewSession(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={60}>60 minutes</option>
                        <option value={90}>90 minutes</option>
                        <option value={120}>120 minutes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Day
                      </label>
                      <select
                        value={newSession.schedule.day}
                        onChange={(e) => setNewSession(prev => ({ 
                          ...prev, 
                          schedule: { ...prev.schedule, day: e.target.value }
                        }))}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                        <option value="sunday">Sunday</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={newSession.schedule.time}
                      onChange={(e) => setNewSession(prev => ({ 
                        ...prev, 
                        schedule: { ...prev.schedule, time: e.target.value }
                      }))}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="bg-gray-600 hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Create Session
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* My Group Sessions Tab */}
        {activeTab === 'my-groups' && (
          <div className="space-y-6">
            {groupSessions.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No group sessions created</h3>
                <p className="text-gray-500">Create your first group session to start helping seekers.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupSessions.map((session) => (
                  <div key={session.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {session.topic}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              session.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {session.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">{session.description}</p>
                        
                        <div className="text-sm text-gray-500">
                          <p><span className="font-medium">Frequency:</span> {session.frequency}</p>
                          <p><span className="font-medium">Duration:</span> {session.duration} minutes</p>
                          <p><span className="font-medium">Max Participants:</span> {session.maxParticipants}</p>
                          <p><span className="font-medium">Participants:</span> {session.participants.length}</p>
                        </div>

                        <div className="pt-4 space-y-2">
                          <Button
                            onClick={() => toggleSessionStatus(session.id, !session.isActive)}
                            className={`w-full ${
                              session.isActive
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                          >
                            {session.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          
                          {session.isActive && (
                            <Button
                              onClick={() => inviteSeekers(session.id)}
                              className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                              Invite Seekers
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Available Groups Tab */}
        {activeTab === 'all-groups' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">All Available Group Sessions</h3>
              <p className="text-gray-500">Browse all group sessions available to seekers.</p>
            </div>
          </div>
        )}

        {/* Participants Tab */}
        {activeTab === 'participants' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Group Participants</h3>
              <p className="text-gray-500">Manage participants in your group sessions.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


