'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Mentee {
  id: number;
  status: string;
  notes: string;
  createdAt: string;
  seeker: {
    user: {
      id: number;
      username: string;
      location: string;
      ageRange: string;
      gender: string;
    };
    seekerProfile: {
      struggles: string[];
      preferredCommunication: string;
      preferredFormat: string;
    };
  };
}

export default function MentorDashboard() {
  const { user } = useAuth();
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mentees');

  useEffect(() => {
    if (user?.userRole === 'DISCIPLE_MAKER') {
      loadMentees();
    }
  }, [user]);

  const loadMentees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/mentors/mentees');
      setMentees(response.data.relationships);
    } catch (error) {
      console.error('Error loading mentees:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRelationshipStatus = async (relationshipId: number, status: string) => {
    try {
      await api.patch(`/mentors/relationships/${relationshipId}`, { status });
      await loadMentees();
    } catch (error) {
      console.error('Error updating relationship:', error);
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
          <h1 className="text-3xl font-bold text-gray-900">Mentor Dashboard</h1>
          <p className="mt-2 text-gray-600">Guide seekers on their spiritual journey</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'mentees', name: 'My Mentees' },
              { id: 'sessions', name: 'Sessions' },
              { id: 'groups', name: 'Group Sessions' },
              { id: 'profile', name: 'Profile' }
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

        {/* My Mentees Tab */}
        {activeTab === 'mentees' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Mentee Requests</h3>
                {mentees.length === 0 ? (
                  <p className="text-gray-500">No mentee requests yet.</p>
                ) : (
                  <div className="space-y-4">
                    {mentees.map((mentee) => (
                      <div key={mentee.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-medium text-gray-900">
                              {mentee.seeker.user.username}
                            </h4>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Location:</span> {mentee.seeker.user.location}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Age Range:</span> {mentee.seeker.user.ageRange}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Struggles:</span>{' '}
                                {mentee.seeker.seekerProfile.struggles.join(', ')}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Communication:</span>{' '}
                                {mentee.seeker.seekerProfile.preferredCommunication}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Format:</span>{' '}
                                {mentee.seeker.seekerProfile.preferredFormat}
                              </p>
                              {mentee.notes && (
                                <p className="text-sm text-gray-600 mt-2">
                                  <span className="font-medium">Message:</span> {mentee.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="ml-4 flex flex-col space-y-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                mentee.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : mentee.status === 'accepted'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {mentee.status.charAt(0).toUpperCase() + mentee.status.slice(1)}
                            </span>
                            {mentee.status === 'pending' && (
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => updateRelationshipStatus(mentee.id, 'accepted')}
                                  className="bg-green-600 hover:bg-green-700 text-sm"
                                >
                                  Accept
                                </Button>
                                <Button
                                  onClick={() => updateRelationshipStatus(mentee.id, 'rejected')}
                                  className="bg-red-600 hover:bg-red-700 text-sm"
                                >
                                  Decline
                                </Button>
                              </div>
                            )}
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

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Sessions</h3>
              <p className="text-gray-500">No sessions scheduled yet.</p>
            </div>
          </div>
        )}

        {/* Group Sessions Tab */}
        {activeTab === 'groups' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Group Sessions</h3>
              <p className="text-gray-500">Group session management coming soon.</p>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Profile</h3>
              <p className="text-gray-500">Profile management coming soon.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


