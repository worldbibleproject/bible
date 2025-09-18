'use client';

import React, { useState } from 'react';
import { XMarkIcon, CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorId: number;
  mentorName: string;
  selectedTime: string;
  selectedDate: Date;
  onBookingSuccess: () => void;
}

interface BookingFormData {
  notes: string;
  duration: number;
  preferredCommunication: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  mentorId,
  mentorName,
  selectedTime,
  selectedDate,
  onBookingSuccess
}: BookingModalProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    notes: '',
    duration: 30,
    preferredCommunication: 'video'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create the scheduled time by combining date and time
      const [hours, minutes] = selectedTime.split(':');
      const scheduledTime = new Date(selectedDate);
      scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const response = await api.post('/sessions/book', {
        mentorId,
        scheduledTime: scheduledTime.toISOString(),
        duration: formData.duration,
        notes: formData.notes,
        preferredCommunication: formData.preferredCommunication
      });

      if (response.data.success) {
        onBookingSuccess();
        onClose();
        // Reset form
        setFormData({
          notes: '',
          duration: 30,
          preferredCommunication: 'video'
        });
      } else {
        setError(response.data.error || 'Failed to book session');
      }
    } catch (error: any) {
      console.error('Error booking session:', error);
      setError(error.response?.data?.error || 'Failed to book session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Book Session
              </h3>
              <p className="text-sm text-gray-500">
                Confirm your mentorship session details
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Session Details */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <UserIcon className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{mentorName}</div>
                  <div className="text-xs text-gray-500">Mentor</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{formatDate(selectedDate)}</div>
                  <div className="text-xs text-gray-500">Date</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <ClockIcon className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{formatTime(selectedTime)}</div>
                  <div className="text-xs text-gray-500">Time</div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Session Duration
                </label>
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </div>

              {/* Communication Preference */}
              <div>
                <label htmlFor="preferredCommunication" className="block text-sm font-medium text-gray-700 mb-1">
                  Communication Method
                </label>
                <select
                  id="preferredCommunication"
                  name="preferredCommunication"
                  value={formData.preferredCommunication}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="video">Video Call</option>
                  <option value="phone">Phone Call</option>
                  <option value="chat">Text Chat</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Share any specific topics you'd like to discuss or questions you have..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Booking...' : 'Book Session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
