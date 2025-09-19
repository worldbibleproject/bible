'use client';

import React, { useState, useEffect } from 'react';
import { CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';

interface AvailabilitySlot {
  id: number;
  mentorId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface Mentor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  specialties?: string[];
}

interface SchedulingCalendarProps {
  mentorId: number;
  onBookSession: (timeSlot: string, date: Date) => void;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SchedulingCalendar({ mentorId, onBookSession }: SchedulingCalendarProps) {
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMentorDetails();
    fetchAvailability();
  }, [mentorId]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate, mentorId]);

  const fetchMentorDetails = async () => {
    try {
      const response = await api.get(`/mentors/${mentorId}`);
      if (response.data.success) {
        setMentor(response.data.mentor);
      }
    } catch (error) {
      console.error('Error fetching mentor details:', error);
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await api.get(`/mentors/${mentorId}/availability`);
      if (response.data.success) {
        setAvailability(response.data.availability);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await api.get(`/mentors/${mentorId}/available-slots`, {
        params: {
          date: selectedDate.toISOString().split('T')[0]
        }
      });
      if (response.data.success) {
        setAvailableSlots(response.data.slots);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setError('Failed to load available time slots');
    }
  };

  const getAvailabilityForDay = (dayOfWeek: number) => {
    return availability.filter(slot => slot.dayOfWeek === dayOfWeek && slot.isAvailable);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setError(null);
  };

  const handleSlotClick = (slot: string) => {
    onBookSession(slot, selectedDate);
  };

  const getNextWeekDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
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
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Schedule with {mentor?.firstName} {mentor?.lastName}
            </h3>
            <p className="text-sm text-gray-500">
              Select a date and time for your mentorship session
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Weekly Availability Overview */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Weekly Availability</h4>
          <div className="grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day, index) => {
              const dayAvailability = getAvailabilityForDay(index);
              const hasAvailability = dayAvailability.length > 0;
              
              return (
                <div
                  key={day}
                  className={`p-3 rounded-lg text-center ${
                    hasAvailability 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    {day.substring(0, 3)}
                  </div>
                  <div className={`text-xs ${
                    hasAvailability ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {hasAvailability ? 'Available' : 'Unavailable'}
                  </div>
                  {hasAvailability && (
                    <div className="text-xs text-green-500 mt-1">
                      {dayAvailability.length} slot{dayAvailability.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Date Selection */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Select Date</h4>
          <div className="grid grid-cols-7 gap-2">
            {getNextWeekDates().map((date, index) => {
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const dayAvailability = getAvailabilityForDay(date.getDay());
              const hasAvailability = dayAvailability.length > 0;
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateChange(date)}
                  disabled={!hasAvailability}
                  className={`p-3 rounded-lg text-center transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : hasAvailability
                      ? 'bg-white border border-gray-200 hover:bg-gray-50'
                      : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="text-xs font-medium">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-sm font-semibold">
                    {date.getDate()}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Available Time Slots */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Available Times for {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h4>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {availableSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ClockIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No available time slots for this date</p>
              <p className="text-sm">Please select a different date</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => handleSlotClick(slot)}
                  className="p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-center"
                >
                  <div className="text-sm font-medium text-blue-900">
                    {formatTime(slot)}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    30 min session
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mentor Info */}
        {mentor && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="bg-gray-200 p-2 rounded-lg">
                <UserIcon className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h5 className="font-medium text-gray-900">
                  {mentor.firstName} {mentor.lastName}
                </h5>
                {mentor.bio && (
                  <p className="text-sm text-gray-600 mt-1">{mentor.bio}</p>
                )}
                {mentor.specialties && mentor.specialties.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Specialties:</div>
                    <div className="flex flex-wrap gap-1">
                      {mentor.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
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
