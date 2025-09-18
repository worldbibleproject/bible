'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { WizardStep1 } from '@/components/wizard/WizardStep1';
import { WizardStep2 } from '@/components/wizard/WizardStep2';
import { WizardResults } from '@/components/wizard/WizardResults';
import { 
  HeartIcon, 
  SparklesIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface WizardData {
  feeling: string;
  barrier: string;
  heart: string;
  spiritual_background: string;
  life_stage: string;
  preferred_style: string;
}

interface WizardResults {
  references: any[];
  prayer: string;
  verses: any[];
}

export default function WizardPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData | null>(null);
  const [results, setResults] = useState<WizardResults | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const totalSteps = 3;

  const handleStep1Submit = (data: WizardData) => {
    setWizardData(data);
    setCurrentStep(2);
  };

  const handleStep2Submit = async () => {
    if (!wizardData) return;

    try {
      setIsProcessing(true);
      const response = await apiClient.processWizard(wizardData);
      
      if (response.data) {
        setResults(response.data);
        setCurrentStep(3);
        toast.success('Your personalized spiritual guidance is ready!');
      } else {
        throw new Error('No data received');
      }
    } catch (error: any) {
      console.error('Wizard processing error:', error);
      toast.error(error.response?.data?.error || 'Failed to process your responses. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveResults = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save your results');
      return;
    }

    try {
      setIsSaving(true);
      // Results are automatically saved when processing
      toast.success('Your results have been saved!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save results');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateAccount = () => {
    router.push('/register');
  };

  const handleGoToDashboard = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/');
    }
  };

  const handleStartOver = () => {
    setWizardData(null);
    setResults(null);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gradient">Evangelism App</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="wizard-card">
          <div className="wizard-header">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              <HeartIcon className="w-10 h-10 inline-block mr-3 text-primary-600" />
              Your Spiritual Journey
            </h1>
            <p className="text-xl text-gray-600">
              Let's discover what God has in store for you
            </p>
          </div>

          <div className="wizard-body">
            {/* Step Indicator */}
            <div className="step-indicator">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`step ${
                      step < currentStep
                        ? 'step-completed'
                        : step === currentStep
                        ? 'step-active'
                        : 'step-inactive'
                    }`}
                  >
                    {step}
                  </div>
                  {step < totalSteps && (
                    <div
                      className={`step-line ${
                        step < currentStep ? 'step-line-completed' : ''
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Step Content */}
            <div className="min-h-[400px]">
              {currentStep === 1 && (
                <WizardStep1
                  data={wizardData}
                  onSubmit={handleStep1Submit}
                />
              )}

              {currentStep === 2 && (
                <WizardStep2
                  data={wizardData}
                  isProcessing={isProcessing}
                  onSubmit={handleStep2Submit}
                  onBack={() => setCurrentStep(1)}
                />
              )}

              {currentStep === 3 && results && (
                <WizardResults
                  results={results}
                  isAuthenticated={isAuthenticated}
                  isSaving={isSaving}
                  onSave={handleSaveResults}
                  onCreateAccount={handleCreateAccount}
                  onGoToDashboard={handleGoToDashboard}
                  onStartOver={handleStartOver}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


