'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Seeker {
  id: number;
  username: string;
  email: string;
  location?: string;
  seekerProfile?: {
    faithLevel?: string;
    struggles?: string[];
    churchBackground?: string;
    preferredFormat?: string;
  };
}

interface HandoffForm {
  seekerId: number;
  reason: string;
  seekerReadiness: 'ready' | 'needs_more_time' | 'not_ready';
  notes: string;
  recommendedChurches: number[];
}

export default function MentorHandoff() {
  const { user } = useAuth();
  const [seekers, setSeekers] = useState<Seeker[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSeeker, setSelectedSeeker] = useState<Seeker | null>(null);
  const [formData, setFormData] = useState<HandoffForm>({
    seekerId: 0,
    reason: '',
    seekerReadiness: 'ready',
    notes: '',
    recommendedChurches: []
  });

  useEffect(() => {
    if (user?.userRole === 'DISCIPLE_MAKER') {
      loadMentees();
    }
  }, [user]);

  const loadMentees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/mentors/mentees');
      if (response.data.success) {
        setSeekers(response.data.mentees);
      }
    } catch (error) {
      console.error('Error loading mentees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeekerSelect = (seeker: Seeker) => {
    setSelectedSeeker(seeker);
    setFormData(prev => ({
      ...prev,
      seekerId: seeker.id
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeeker) return;

    try {
      setSubmitting(true);
      await api.post('/handoff/initiate', formData);
      
      // Reset form
      setFormData({
        seekerId: 0,
        reason: '',
        seekerReadiness: 'ready',
        notes: '',
        recommendedChurches: []
      });
      setSelectedSeeker(null);
      
      alert('Handoff initiated successfully! A church finder will contact your mentee soon.');
    } catch (error) {
      console.error('Error initiating handoff:', error);
      alert('Failed to initiate handoff. Please try again.');
    } finally {
      setSubmitting(false);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Initiate Church Handoff</h1>
          <p className="mt-2 text-gray-600">
            When your mentee is ready, initiate a handoff to connect them with a church finder
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Seeker Selection */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Select Mentee</h2>
            </div>
            <div className="p-6">
              {seekers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No mentees found.</p>
              ) : (
                <div className="space-y-3">
                  {seekers.map((seeker) => (
                    <button
                      key={seeker.id}
                      onClick={() => handleSeekerSelect(seeker)}
                      className={`w-full p-4 text-left border rounded-lg transition-colors ${
                        selectedSeeker?.id === seeker.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{seeker.username}</h3>
                          <p className="text-sm text-gray-500">{seeker.email}</p>
                          {seeker.location && (
                            <p className="text-sm text-gray-500">📍 {seeker.location}</p>
                          )}
                        </div>
                        {selectedSeeker?.id === seeker.id && (
                          <div className="text-blue-600">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {seeker.seekerProfile && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p><strong>Faith Level:</strong> {seeker.seekerProfile.faithLevel || 'Not specified'}</p>
                          <p><strong>Format:</strong> {seeker.seekerProfile.preferredFormat || 'Not specified'}</p>
                          {seeker.seekerProfile.struggles && seeker.seekerProfile.struggles.length > 0 && (
                            <p><strong>Struggles:</strong> {seeker.seekerProfile.struggles.join(', ')}</p>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Handoff Form */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Handoff Details</h2>
            </div>
            <div className="p-6">
              {!selectedSeeker ? (
                <p className="text-gray-500 text-center py-8">
                  Please select a mentee to initiate handoff
                </p>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Handoff *
                    </label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Explain why you're recommending this mentee for church connection..."
                      required
                    />
                  </div>

                  {/* Readiness Assessment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mentee Readiness *
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'ready', label: 'Ready for Church Connection', description: 'Mentee is spiritually mature and ready to join a church community' },
                        { value: 'needs_more_time', label: 'Needs More Time', description: 'Mentee is progressing but needs more mentoring before church connection' },
                        { value: 'not_ready', label: 'Not Ready', description: 'Mentee is not ready for church connection at this time' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-start">
                          <input
                            type="radio"
                            name="readiness"
                            value={option.value}
                            checked={formData.seekerReadiness === option.value}
                            onChange={(e) => setFormData(prev => ({ ...prev, seekerReadiness: e.target.value as any }))}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{option.label}</div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Any additional information that would help the church finder..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={submitting || !formData.reason.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {submitting ? (
                        <>
                          <LoadingSpinner size="sm" />
                          Initiating Handoff...
                        </>
                      ) : (
                        'Initiate Church Handoff'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Information Panel */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">About Church Handoffs</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              When you initiate a handoff, a church finder will be assigned to help your mentee find the right church community.
            </p>
            <p>
              The church finder will review your mentee's profile, your recommendations, and suggest churches that match their needs and preferences.
            </p>
            <p>
              Your mentee will be notified about the handoff and can expect to hear from a church finder within 24-48 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
