'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { WizardData } from '@/types';
import { 
  SparklesIcon,
  ArrowLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface WizardStep2Props {
  data: WizardData | null;
  isProcessing: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

export function WizardStep2({ data, isProcessing, onSubmit, onBack }: WizardStep2Props) {
  const [processingStep, setProcessingStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const processingSteps = [
    'Analyzing your responses...',
    'Generating personalized Scripture references...',
    'Creating your custom prayer...',
    'Preparing annotated verses...',
    'Finalizing your spiritual guidance...'
  ];

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setProcessingStep(prev => {
          if (prev < processingSteps.length - 1) {
            return prev + 1;
          } else {
            setIsComplete(true);
            clearInterval(interval);
            return prev;
          }
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isProcessing, processingSteps.length]);

  if (isComplete) {
    return (
      <div className="text-center py-12">
        <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Your Spiritual Guidance is Ready!
        </h3>
        <p className="text-lg text-gray-600 mb-8">
          We've created personalized Scripture, prayer, and verses just for you.
        </p>
        <Button
          onClick={onSubmit}
          className="btn-primary btn-lg"
        >
          View Your Results
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="bg-primary-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <SparklesIcon className="w-12 h-12 text-primary-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          AI Processing Your Responses
        </h2>
        <p className="text-lg text-gray-600">
          Our AI is analyzing your answers and creating personalized spiritual guidance
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What We're Creating for You:
          </h3>
          <div className="space-y-3 text-left">
            <div className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
              <span>50 personalized Scripture references from the KJV</span>
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
              <span>500+ word custom prayer tailored to your situation</span>
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
              <span>10 annotated verses with MacArthur-style commentary</span>
            </div>
          </div>
        </div>

        {isProcessing && (
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-center mb-4">
              <LoadingSpinner size="lg" className="mr-3" />
              <span className="text-lg font-medium text-gray-900">
                {processingSteps[processingStep]}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((processingStep + 1) / processingSteps.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button
            onClick={onBack}
            variant="outline"
            disabled={isProcessing}
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button
            onClick={onSubmit}
            disabled={isProcessing || !isComplete}
            className="btn-primary"
          >
            {isProcessing ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}


