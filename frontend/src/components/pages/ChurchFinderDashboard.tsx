'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Church {
  id: number;
  name: string;
  denomination: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  pastorName: string;
  serviceTimes: string[];
  description: string;
  specialties: string[];
  sizeCategory: string;
  isVetted: boolean;
  vettedBy: number;
  vettedDate: string;
}

export default function ChurchFinderDashboard() {
  const { user } = useAuth();
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('churches');

  useEffect(() => {
    if (user?.userRole === 'CHURCH_FINDER') {
      loadChurches();
    }
  }, [user]);

  const loadChurches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/churches');
      setChurches(response.data.churches);
    } catch (error) {
      console.error('Error loading churches:', error);
    } finally {
      setLoading(false);
    }
  };

  const vetChurch = async (churchId: number, vetted: boolean) => {
    try {
      await api.patch(`/churches/${churchId}/vet`, { vetted });
      await loadChurches();
    } catch (error) {
      console.error('Error vetting church:', error);
    }
  };

  if (user?.userRole !== 'CHURCH_FINDER') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need church finder privileges to access this page.</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Church Finder Dashboard</h1>
          <p className="mt-2 text-gray-600">Help seekers find the right church community</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'churches', name: 'Churches' },
              { id: 'seekers', name: 'Seekers' },
              { id: 'connections', name: 'Connections' }
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

        {/* Churches Tab */}
        {activeTab === 'churches' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Church Directory</h3>
                {churches.length === 0 ? (
                  <p className="text-gray-500">No churches in the directory yet.</p>
                ) : (
                  <div className="space-y-4">
                    {churches.map((church) => (
                      <div key={church.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="text-lg font-medium text-gray-900">
                                {church.name}
                              </h4>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  church.isVetted
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {church.isVetted ? 'Vetted' : 'Pending Review'}
                              </span>
                            </div>
                            
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Denomination:</span> {church.denomination}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Address:</span> {church.address}, {church.city}, {church.state} {church.zipCode}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Pastor:</span> {church.pastorName}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Service Times:</span> {church.serviceTimes.join(', ')}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Size:</span> {church.sizeCategory}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Specialties:</span>{' '}
                                {church.specialties.join(', ')}
                              </p>
                              <p className="text-sm text-gray-600 mt-2">
                                {church.description}
                              </p>
                            </div>

                            <div className="mt-3 flex space-x-2">
                              {church.phone && (
                                <a
                                  href={`tel:${church.phone}`}
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                  📞 {church.phone}
                                </a>
                              )}
                              {church.email && (
                                <a
                                  href={`mailto:${church.email}`}
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                  ✉️ {church.email}
                                </a>
                              )}
                              {church.website && (
                                <a
                                  href={church.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                  🌐 Website
                                </a>
                              )}
                            </div>
                          </div>
                          
                          <div className="ml-4 flex flex-col space-y-2">
                            {!church.isVetted && (
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => vetChurch(church.id, true)}
                                  className="bg-green-600 hover:bg-green-700 text-sm"
                                >
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => vetChurch(church.id, false)}
                                  className="bg-red-600 hover:bg-red-700 text-sm"
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                            {church.isVetted && (
                              <p className="text-xs text-gray-500">
                                Vetted on {new Date(church.vettedDate).toLocaleDateString()}
                              </p>
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

        {/* Seekers Tab */}
        {activeTab === 'seekers' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Handoffs</h3>
                <PendingHandoffs />
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Available Seekers</h3>
                <AvailableSeekers />
              </div>
            </div>
          </div>
        )}

        {/* Connections Tab */}
        {activeTab === 'connections' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Church Connections</h3>
              <p className="text-gray-500">Connection management coming soon.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Pending Handoffs Component
function PendingHandoffs() {
  const [handoffs, setHandoffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingHandoffs();
  }, []);

  const loadPendingHandoffs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/handoff/pending');
      if (response.data.success) {
        setHandoffs(response.data.connections);
      }
    } catch (error) {
      console.error('Error loading pending handoffs:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateHandoffStatus = async (connectionId: number, status: string, notes?: string) => {
    try {
      await api.patch(`/handoff/${connectionId}/status`, { status, notes });
      await loadPendingHandoffs();
    } catch (error) {
      console.error('Error updating handoff status:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner size="sm" />;
  }

  if (handoffs.length === 0) {
    return <p className="text-gray-500">No pending handoffs.</p>;
  }

  return (
    <div className="space-y-4">
      {handoffs.map((handoff) => (
        <div key={handoff.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-lg font-medium text-gray-900">
                {handoff.seeker.user.username}
              </h4>
              <p className="text-sm text-gray-600">{handoff.seeker.user.email}</p>
              <p className="text-sm text-gray-600">📍 {handoff.seeker.user.location || 'Location not specified'}</p>
              
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">
                  <strong>Mentor Notes:</strong> {handoff.connectionNotes}
                </p>
              </div>
            </div>
            
            <div className="ml-4 flex flex-col space-y-2">
              <Button
                onClick={() => updateHandoffStatus(handoff.id, 'CONTACTED')}
                className="bg-blue-600 hover:bg-blue-700 text-sm"
              >
                Mark as Contacted
              </Button>
              <Button
                onClick={() => updateHandoffStatus(handoff.id, 'VISITED')}
                className="bg-green-600 hover:bg-green-700 text-sm"
              >
                Visited Church
              </Button>
              <Button
                onClick={() => updateHandoffStatus(handoff.id, 'JOINED')}
                className="bg-purple-600 hover:bg-purple-700 text-sm"
              >
                Joined Church
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Available Seekers Component
function AvailableSeekers() {
  const [seekers, setSeekers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailableSeekers();
  }, []);

  const loadAvailableSeekers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/churches/seekers');
      if (response.data.success) {
        setSeekers(response.data.seekers);
      }
    } catch (error) {
      console.error('Error loading available seekers:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectToChurch = async (seekerId: number, churchId: number) => {
    try {
      await api.post(`/churches/${churchId}/connect/${seekerId}`, {
        connectionNotes: 'Direct connection initiated by church finder'
      });
      await loadAvailableSeekers();
    } catch (error) {
      console.error('Error connecting seeker to church:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner size="sm" />;
  }

  if (seekers.length === 0) {
    return <p className="text-gray-500">No available seekers.</p>;
  }

  return (
    <div className="space-y-4">
      {seekers.map((seeker) => (
        <div key={seeker.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-lg font-medium text-gray-900">
                {seeker.user.username}
              </h4>
              <p className="text-sm text-gray-600">{seeker.user.email}</p>
              <p className="text-sm text-gray-600">📍 {seeker.user.location || 'Location not specified'}</p>
              
              <div className="mt-2 text-sm text-gray-600">
                <p><strong>Faith Level:</strong> {seeker.faithLevel || 'Not specified'}</p>
                <p><strong>Church Background:</strong> {seeker.churchBackground || 'Not specified'}</p>
                <p><strong>Preferred Format:</strong> {seeker.preferredFormat || 'Not specified'}</p>
              </div>
            </div>
            
            <div className="ml-4">
              <Button
                onClick={() => connectToChurch(seeker.user.id, 1)} // Default church ID
                className="bg-blue-600 hover:bg-blue-700 text-sm"
              >
                Connect to Church
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


