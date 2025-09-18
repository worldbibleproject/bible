'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AvailabilitySchedule {
  monday: string[];
  tuesday: string[];
  wednesday: string[];
  thursday: string[];
  friday: string[];
  saturday: string[];
  sunday: string[];
}

interface GroupSession {
  topic: string;
  description: string;
  frequency: string;
  maxParticipants: number;
  duration: number;
}

export default function MentorProfileSetup() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    // Personal Testimony
    testimony: '',
    yearsChristian: '',
    denomination: '',
    traumas: [] as string[],
    healingStory: '',
    keyScriptures: '',
    
    // Mentoring Setup
    specialties: [] as string[],
    additionalExpertise: '',
    maxMentees: 5,
    sessionTypes: 'both' as '1on1' | 'group' | 'both',
    communicationPreference: 'both' as 'video' | 'chat' | 'both',
    sessionDuration: 60,
    mentoringPhilosophy: '',
    
    // Group Sessions
    groupTopics: [] as string[],
    groupDescription: '',
    
    // Availability Schedule
    availabilitySchedule: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    } as AvailabilitySchedule
  });

  const [groupSessions, setGroupSessions] = useState<GroupSession[]>([]);
  const [newGroupSession, setNewGroupSession] = useState<GroupSession>({
    topic: '',
    description: '',
    frequency: 'weekly',
    maxParticipants: 10,
    duration: 90
  });

  const struggleOptions = [
    'addiction', 'depression', 'anxiety', 'family_issues', 'grief', 'anger',
    'pornography', 'porn_addiction', 'substance_abuse', 'eating_disorder',
    'self_harm', 'suicidal_thoughts', 'divorce', 'abuse', 'trauma',
    'financial_stress', 'work_stress', 'loneliness', 'identity_crisis'
  ];

  const specialtyOptions = [
    'addiction_recovery', 'depression', 'anxiety', 'family_healing',
    'grief_counseling', 'anger_management', 'purity_ministry', 'spiritual_growth',
    'marriage_counseling', 'parenting', 'financial_stewardship', 'career_guidance',
    'mental_health', 'trauma_healing', 'discipleship', 'evangelism'
  ];

  const timeSlots = [
    '6:00-7:00', '7:00-8:00', '8:00-9:00', '9:00-10:00', '10:00-11:00',
    '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00',
    '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00', '20:00-21:00',
    '21:00-22:00'
  ];

  const handleInputChange = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setProfileData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  const handleScheduleChange = (day: string, timeSlot: string, checked: boolean) => {
    setProfileData(prev => ({
      ...prev,
      availabilitySchedule: {
        ...prev.availabilitySchedule,
        [day]: checked
          ? [...prev.availabilitySchedule[day as keyof AvailabilitySchedule], timeSlot]
          : prev.availabilitySchedule[day as keyof AvailabilitySchedule].filter(slot => slot !== timeSlot)
      }
    }));
  };

  const addGroupSession = () => {
    if (newGroupSession.topic && newGroupSession.description) {
      setGroupSessions(prev => [...prev, newGroupSession]);
      setNewGroupSession({
        topic: '',
        description: '',
        frequency: 'weekly',
        maxParticipants: 10,
        duration: 90
      });
    }
  };

  const removeGroupSession = (index: number) => {
    setGroupSessions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.post('/mentors/profile', {
        ...profileData,
        groupSessions
      });
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mentor Profile Setup</h1>
          <p className="mt-2 text-gray-600">Complete your profile to start mentoring seekers</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: 'Personal Testimony' },
              { step: 2, title: 'Mentoring Setup' },
              { step: 3, title: 'Group Sessions' },
              { step: 4, title: 'Availability' }
            ].map((step) => (
              <div key={step.step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.step}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {step.title}
                </span>
                {step.step < 4 && (
                  <div className="w-8 h-0.5 bg-gray-200 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Personal Testimony */}
        {currentStep === 1 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Personal Testimony</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Testimony *
                </label>
                <textarea
                  value={profileData.testimony}
                  onChange={(e) => handleInputChange('testimony', e.target.value)}
                  rows={6}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Share your story of how you came to Christ and how He has transformed your life..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years as Christian *
                  </label>
                  <select
                    value={profileData.yearsChristian}
                    onChange={(e) => handleInputChange('yearsChristian', e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="1-2">1-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="6-10">6-10 years</option>
                    <option value="11-20">11-20 years</option>
                    <option value="20+">20+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Denomination
                  </label>
                  <input
                    type="text"
                    value={profileData.denomination}
                    onChange={(e) => handleInputChange('denomination', e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Baptist, Methodist, Non-denominational"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Struggles You've Overcome Through Christ *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {struggleOptions.map((struggle) => (
                    <label key={struggle} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profileData.traumas.includes(struggle)}
                        onChange={(e) => handleArrayChange('traumas', struggle, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {struggle.replace(/_/g, ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Healing Story *
                </label>
                <textarea
                  value={profileData.healingStory}
                  onChange={(e) => handleInputChange('healingStory', e.target.value)}
                  rows={4}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe how God helped you overcome your struggles. Be specific about the process, prayers, and Scriptures that helped..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Scriptures That Helped You
                </label>
                <input
                  type="text"
                  value={profileData.keyScriptures}
                  onChange={(e) => handleInputChange('keyScriptures', e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Romans 8:28, Philippians 4:13, 2 Corinthians 5:17"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Mentoring Setup */}
        {currentStep === 2 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Mentoring Setup</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Specialties *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {specialtyOptions.map((specialty) => (
                    <label key={specialty} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profileData.specialties.includes(specialty)}
                        onChange={(e) => handleArrayChange('specialties', specialty, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {specialty.replace(/_/g, ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Expertise
                </label>
                <input
                  type="text"
                  value={profileData.additionalExpertise}
                  onChange={(e) => handleInputChange('additionalExpertise', e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Certified addiction counselor, 10+ years in recovery ministry"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Mentees *
                  </label>
                  <select
                    value={profileData.maxMentees}
                    onChange={(e) => handleInputChange('maxMentees', parseInt(e.target.value))}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Duration (minutes) *
                  </label>
                  <select
                    value={profileData.sessionDuration}
                    onChange={(e) => handleInputChange('sessionDuration', parseInt(e.target.value))}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>120 minutes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Types *
                  </label>
                  <select
                    value={profileData.sessionTypes}
                    onChange={(e) => handleInputChange('sessionTypes', e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="1on1">1-on-1 Only</option>
                    <option value="group">Group Only</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Communication Preference *
                  </label>
                  <select
                    value={profileData.communicationPreference}
                    onChange={(e) => handleInputChange('communicationPreference', e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="video">Video Only</option>
                    <option value="chat">Chat Only</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Mentoring Philosophy *
                </label>
                <textarea
                  value={profileData.mentoringPhilosophy}
                  onChange={(e) => handleInputChange('mentoringPhilosophy', e.target.value)}
                  rows={4}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your approach to mentoring. What do you believe about helping others grow spiritually?"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Group Sessions */}
        {currentStep === 3 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Group Sessions</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Topics You Can Lead *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {specialtyOptions.map((specialty) => (
                    <label key={specialty} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profileData.groupTopics.includes(specialty)}
                        onChange={(e) => handleArrayChange('groupTopics', specialty, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {specialty.replace(/_/g, ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Session Description
                </label>
                <textarea
                  value={profileData.groupDescription}
                  onChange={(e) => handleInputChange('groupDescription', e.target.value)}
                  rows={3}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your group sessions and what participants can expect..."
                />
              </div>

              {/* Add Group Session */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Specific Group Sessions</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topic
                    </label>
                    <input
                      type="text"
                      value={newGroupSession.topic}
                      onChange={(e) => setNewGroupSession(prev => ({ ...prev, topic: e.target.value }))}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Porn Addiction Recovery"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      value={newGroupSession.frequency}
                      onChange={(e) => setNewGroupSession(prev => ({ ...prev, frequency: e.target.value }))}
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
                      value={newGroupSession.maxParticipants}
                      onChange={(e) => setNewGroupSession(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      min="2"
                      max="20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <select
                      value={newGroupSession.duration}
                      onChange={(e) => setNewGroupSession(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={60}>60 minutes</option>
                      <option value={90}>90 minutes</option>
                      <option value={120}>120 minutes</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newGroupSession.description}
                    onChange={(e) => setNewGroupSession(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe what this group session covers and who it's for..."
                  />
                </div>

                <Button
                  onClick={addGroupSession}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add Group Session
                </Button>
              </div>

              {/* Group Sessions List */}
              {groupSessions.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Your Group Sessions</h3>
                  <div className="space-y-3">
                    {groupSessions.map((session, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{session.topic}</h4>
                            <p className="text-sm text-gray-600 mt-1">{session.description}</p>
                            <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                              <span>{session.frequency}</span>
                              <span>{session.maxParticipants} participants</span>
                              <span>{session.duration} minutes</span>
                            </div>
                          </div>
                          <Button
                            onClick={() => removeGroupSession(index)}
                            className="bg-red-600 hover:bg-red-700 text-sm"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Availability Schedule */}
        {currentStep === 4 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Availability Schedule</h2>
            
            <div className="space-y-6">
              <p className="text-sm text-gray-600">
                Select the time slots when you're available for mentoring sessions. This helps seekers know when they can book sessions with you.
              </p>

              {Object.entries(profileData.availabilitySchedule).map(([day, slots]) => (
                <div key={day} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3 capitalize">
                    {day}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {timeSlots.map((timeSlot) => (
                      <label key={timeSlot} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={slots.includes(timeSlot)}
                          onChange={(e) => handleScheduleChange(day, timeSlot, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {timeSlot}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <Button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50"
          >
            Previous
          </Button>

          <div className="flex space-x-4">
            {currentStep < 4 ? (
              <Button
                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? <LoadingSpinner size="sm" /> : 'Save Profile'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


