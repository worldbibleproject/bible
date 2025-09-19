'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, VideoCameraIcon, MicrophoneIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  userName: string;
  userEmail: string;
}

interface MeetingData {
  id: number;
  meetingId: string;
  topic: string;
  joinUrl: string;
  password: string;
  signature: string;
  userName: string;
  userEmail: string;
}

export default function VideoCallModal({ isOpen, onClose, meetingId, userName, userEmail }: VideoCallModalProps) {
  const [meetingData, setMeetingData] = useState<MeetingData | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && meetingId) {
      joinMeeting();
    }
  }, [isOpen, meetingId]);

  const joinMeeting = async () => {
    try {
      setIsJoining(true);
      setError(null);

      const response = await api.post('/video/join-meeting', {
        meetingId
      });

      if (response.data.success) {
        setMeetingData(response.data.meeting);
        await initializeZoomSDK(response.data.meeting);
      } else {
        setError(response.data.error || 'Failed to join meeting');
      }
    } catch (error: any) {
      console.error('Error joining meeting:', error);
      setError(error.response?.data?.error || 'Failed to join meeting');
    } finally {
      setIsJoining(false);
    }
  };

  const initializeZoomSDK = async (meeting: MeetingData) => {
    try {
      // Load Zoom SDK dynamically
      const script = document.createElement('script');
      script.src = 'https://source.zoom.us/2.0.0/lib/av/zoom-meeting-2.0.0.min.js';
      script.async = true;
      
      script.onload = () => {
        // Initialize Zoom SDK
        if (window.ZoomMtg) {
          window.ZoomMtg.setZoomJSLib('https://source.zoom.us/2.0.0/lib', '/av');
          window.ZoomMtg.preLoadWasm();
          window.ZoomMtg.prepareWebSDK();
          
          // Initialize SDK
          window.ZoomMtg.init({
            leaveOnPageUnload: true,
            isSupportAV: true,
            success: (success: any) => {
              console.log('Zoom SDK initialized successfully');
              startMeeting(meeting);
            },
            error: (error: any) => {
              console.error('Zoom SDK initialization failed:', error);
              setError('Failed to initialize video call');
            }
          });
        }
      };

      script.onerror = () => {
        setError('Failed to load video call library');
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error('Error initializing Zoom SDK:', error);
      setError('Failed to initialize video call');
    }
  };

  const startMeeting = (meeting: MeetingData) => {
    if (!window.ZoomMtg) {
      setError('Video call library not loaded');
      return;
    }

    window.ZoomMtg.join({
      meetingNumber: meeting.meetingId,
      userName: meeting.userName,
      userEmail: meeting.userEmail,
      passWord: meeting.password,
      tk: meeting.signature,
      success: (success: any) => {
        console.log('Joined meeting successfully');
        setIsJoined(true);
      },
      error: (error: any) => {
        console.error('Failed to join meeting:', error);
        setError('Failed to join meeting');
      }
    });
  };

  const toggleMute = () => {
    if (window.ZoomMtg) {
      window.ZoomMtg.muteAudio(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (window.ZoomMtg) {
      window.ZoomMtg.muteVideo(!isVideoOn);
      setIsVideoOn(!isVideoOn);
    }
  };

  const leaveMeeting = () => {
    if (window.ZoomMtg) {
      window.ZoomMtg.leaveMeeting({
        success: (success: any) => {
          console.log('Left meeting successfully');
          setIsJoined(false);
          onClose();
        },
        error: (error: any) => {
          console.error('Error leaving meeting:', error);
          onClose();
        }
      });
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {meetingData?.topic || 'Video Call'}
              </h3>
              <p className="text-sm text-gray-500">
                Meeting ID: {meetingId}
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
          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {isJoining && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Joining meeting...</p>
              </div>
            )}

            {meetingData && !isJoined && !isJoining && (
              <div className="text-center py-8">
                <div className="bg-blue-50 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <VideoCameraIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to join?
                </h4>
                <p className="text-gray-600 mb-6">
                  Click the button below to start your video call
                </p>
                <button
                  onClick={() => startMeeting(meetingData)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Join Meeting
                </button>
              </div>
            )}

            {isJoined && (
              <div className="space-y-4">
                {/* Video Container */}
                <div className="bg-gray-900 rounded-lg h-96 flex items-center justify-center">
                  <div className="text-center text-white">
                    <VideoCameraIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Video Call Active</p>
                    <p className="text-sm opacity-75">
                      Meeting ID: {meetingId}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={toggleMute}
                    className={`p-3 rounded-full ${
                      isMuted 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <MicrophoneIcon className="h-6 w-6" />
                  </button>
                  
                  <button
                    onClick={toggleVideo}
                    className={`p-3 rounded-full ${
                      !isVideoOn 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <VideoCameraIcon className="h-6 w-6" />
                  </button>
                  
                  <button
                    onClick={leaveMeeting}
                    className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600"
                  >
                    Leave Meeting
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Extend window interface for Zoom SDK
declare global {
  interface Window {
    ZoomMtg: any;
  }
}
