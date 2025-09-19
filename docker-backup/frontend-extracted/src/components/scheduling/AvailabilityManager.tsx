'use client';

import React, { useState, useEffect } from 'react';
import { CalendarIcon, ClockIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';

interface AvailabilitySlot {
  id?: number;
  mentorId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface AvailabilityManagerProps {
  mentorId: number;
}

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export default function AvailabilityManager({ mentorId }: AvailabilityManagerProps) {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailability();
  }, [mentorId]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/mentors/${mentorId}/availability`);
      if (response.data.success) {
        setAvailability(response.data.availability);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      setError('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const addAvailabilitySlot = (dayOfWeek: number) => {
    const newSlot: AvailabilitySlot = {
      mentorId,
      dayOfWeek,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true
    };
    setAvailability(prev => [...prev, newSlot]);
  };

  const removeAvailabilitySlot = (index: number) => {
    setAvailability(prev => prev.filter((_, i) => i !== index));
  };

  const updateAvailabilitySlot = (index: number, field: keyof AvailabilitySlot, value: any) => {
    setAvailability(prev => prev.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    ));
  };

  const saveAvailability = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await api.post(`/mentors/${mentorId}/availability`, {
        availability: availability.filter(slot => slot.isAvailable)
      });

      if (response.data.success) {
        setSuccess('Availability updated successfully');
        await fetchAvailability(); // Refresh data
      } else {
        setError(response.data.error || 'Failed to update availability');
      }
    } catch (error: any) {
      console.error('Error saving availability:', error);
      setError(error.response?.data?.error || 'Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  const getAvailabilityForDay = (dayOfWeek: number) => {
    return availability.filter(slot => slot.dayOfWeek === dayOfWeek);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading availability...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Manage Availability
              </h3>
              <p className="text-sm text-gray-500">
                Set your available hours for mentorship sessions
              </p>
            </div>
          </div>
          <button
            onClick={saveAvailability}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* Weekly Schedule */}
        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day, dayIndex) => {
            const daySlots = getAvailabilityForDay(dayIndex);
            
            return (
              <div key={day} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{day}</h4>
                  <button
                    onClick={() => addAvailabilitySlot(dayIndex)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Slot</span>
                  </button>
                </div>

                {daySlots.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <ClockIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No availability set</p>
                    <p className="text-xs">Click "Add Slot" to set your hours</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {daySlots.map((slot, slotIndex) => {
                      const globalIndex = availability.findIndex(s => s === slot);
                      
                      return (
                        <div key={globalIndex} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            checked={slot.isAvailable}
                            onChange={(e) => updateAvailabilitySlot(globalIndex, 'isAvailable', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => updateAvailabilitySlot(globalIndex, 'startTime', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => updateAvailabilitySlot(globalIndex, 'endTime', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="flex-1 text-sm text-gray-600">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </div>

                          <button
                            onClick={() => removeAvailabilitySlot(globalIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2">Availability Summary</h5>
          <div className="text-sm text-blue-800">
            <p>Total available slots: {availability.filter(slot => slot.isAvailable).length}</p>
            <p>Days with availability: {new Set(availability.filter(slot => slot.isAvailable).map(slot => slot.dayOfWeek)).size}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
