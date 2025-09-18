'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface MentorMatch {
  mentorId: number;
  mentor: {
    user: {
      id: number;
      username: string;
      location: string;
      ageRange: string;
      gender: string;
    };
    specialties: string[];
    yearsChristian: string;
    testimony: string;
    mentoringPhilosophy: string;
  };
  score: number;
  reasons: string[];
  compatibility: {
    ageCompatibility: number;
    struggleCompatibility: number;
    communicationCompatibility: number;
    formatCompatibility: number;
    overallScore: number;
  };
}

export default function SeekerDashboard() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<MentorMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [aiPowered, setAiPowered] = useState(true);

  useEffect(() => {
    if (user?.userRole === 'SEEKER') {
      loadMentors();
    }
  }, [user]);

  const loadMentors = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/seekers/mentors?useAI=${aiPowered}`);
      setMentors(response.data.mentors);
      setAiPowered(response.data.aiPowered);
    } catch (error) {
      console.error('Error loading mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestMentor = async (mentorId: number) => {
    try {
      await api.post(`/seekers/mentors/${mentorId}/request`, {
        message: 'I would like to connect with you for mentoring.'
      });
      alert('Mentor request sent successfully!');
    } catch (error) {
      console.error('Error requesting mentor:', error);
      alert('Failed to send mentor request');
    }
  };

  if (user?.userRole !== 'SEEKER') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need seeker privileges to access this page.</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Your Journey</h1>
          <p className="mt-2 text-gray-600">Find mentors who understand your struggles and can guide you</p>
        </div>

        {/* AI Toggle */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Matching Algorithm:</span>
            <button
              onClick={() => {
                setAiPowered(!aiPowered);
                loadMentors();
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                aiPowered ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  aiPowered ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-gray-500">
              {aiPowered ? 'AI-Powered Matching' : 'Basic Filtering'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'discover', name: 'Discover Mentors' },
              { id: 'my-mentors', name: 'My Mentors' },
              { id: 'sessions', name: 'Sessions' },
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

        {/* Discover Mentors Tab */}
        {activeTab === 'discover' && (
          <div className="space-y-6">
            {aiPowered && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      AI-Powered Matching
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Our AI analyzes your profile, struggles, and preferences to find mentors who are the best match for your journey.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {mentors.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No mentors found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or check back later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentors.map((match) => (
                  <div key={match.mentorId} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {match.mentor.user.username}
                        </h3>
                        <div className="flex items-center">
                          <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {Math.round(match.score * 100)}% Match
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Location:</span> {match.mentor.user.location}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Age Range:</span> {match.mentor.user.ageRange}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Experience:</span> {match.mentor.yearsChristian}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Specialties:</p>
                          <div className="flex flex-wrap gap-1">
                            {match.mentor.specialties.slice(0, 3).map((specialty) => (
                              <span
                                key={specialty}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {specialty.replace(/_/g, ' ')}
                              </span>
                            ))}
                            {match.mentor.specialties.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{match.mentor.specialties.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Why this match:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {match.reasons.slice(0, 3).map((reason, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-green-500 mr-2">•</span>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-4">
                          <Button
                            onClick={() => requestMentor(match.mentorId)}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            Request Mentoring
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Mentors Tab */}
        {activeTab === 'my-mentors' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Mentors</h3>
              <p className="text-gray-500">You haven't connected with any mentors yet.</p>
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


