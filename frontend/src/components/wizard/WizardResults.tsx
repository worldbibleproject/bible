'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  HeartIcon,
  BookOpenIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  UserPlusIcon,
  ArrowRightIcon,
  RefreshIcon
} from '@heroicons/react/24/outline';
import { BibleReference, BibleVerse } from '@/types';

interface WizardResultsProps {
  results: {
    references: BibleReference[];
    prayer: string;
    verses: BibleVerse[];
  };
  isAuthenticated: boolean;
  isSaving: boolean;
  onSave: () => void;
  onCreateAccount: () => void;
  onGoToDashboard: () => void;
  onStartOver: () => void;
}

export function WizardResults({ 
  results, 
  isAuthenticated, 
  isSaving, 
  onSave, 
  onCreateAccount, 
  onGoToDashboard,
  onStartOver 
}: WizardResultsProps) {
  const [activeTab, setActiveTab] = useState<'mini-bible' | 'prayer' | 'verses'>('mini-bible');

  const handlePrint = () => {
    window.print();
  };

  const handleExport = (content: string, filename: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const exportMiniBible = () => {
    const content = results.references
      .map(ref => `${ref.bookName} ${ref.chapterStart}-${ref.chapterEnd}\n${ref.reason}\n${ref.text}\n`)
      .join('\n');
    handleExport(content, 'my-mini-bible.txt');
  };

  const exportPrayer = () => {
    handleExport(results.prayer, 'my-personal-prayer.txt');
  };

  const exportVerses = () => {
    const content = results.verses
      .map(verse => `${verse.reference}\n${verse.text}\n\n${verse.commentary}\n`)
      .join('\n');
    handleExport(content, 'my-annotated-verses.txt');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <HeartIcon className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Your Personalized Spiritual Guidance
        </h2>
        <p className="text-lg text-gray-600">
          Here's what we've prepared specifically for you
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-list mb-6">
        <button
          onClick={() => setActiveTab('mini-bible')}
          className={activeTab === 'mini-bible' ? 'tab-active' : 'tab-inactive'}
        >
          <BookOpenIcon className="w-5 h-5 mr-2" />
          Mini-Bible ({results.references.length} references)
        </button>
        <button
          onClick={() => setActiveTab('prayer')}
          className={activeTab === 'prayer' ? 'tab-active' : 'tab-inactive'}
        >
          <HeartIcon className="w-5 h-5 mr-2" />
          Prayer
        </button>
        <button
          onClick={() => setActiveTab('verses')}
          className={activeTab === 'verses' ? 'tab-active' : 'tab-inactive'}
        >
          <SparklesIcon className="w-5 h-5 mr-2" />
          My Verses ({results.verses.length} verses)
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'mini-bible' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Your Personalized Mini-Bible
              </h3>
              <div className="flex space-x-2">
                <Button
                  onClick={exportMiniBible}
                  variant="outline"
                  size="sm"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  size="sm"
                >
                  <PrinterIcon className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {results.references.map((ref, index) => (
                  <div key={index} className="border-l-4 border-primary-200 pl-4">
                    <h4 className="font-semibold text-gray-900">
                      {ref.bookName} {ref.chapterStart}-{ref.chapterEnd}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">{ref.reason}</p>
                    <p className="text-gray-700 text-sm">{ref.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prayer' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Your Personal Prayer
              </h3>
              <div className="flex space-x-2">
                <Button
                  onClick={exportPrayer}
                  variant="outline"
                  size="sm"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  size="sm"
                >
                  <PrinterIcon className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {results.prayer}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'verses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Your Annotated Verses
              </h3>
              <div className="flex space-x-2">
                <Button
                  onClick={exportVerses}
                  variant="outline"
                  size="sm"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  size="sm"
                >
                  <PrinterIcon className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {results.verses.map((verse, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm border">
                  <h4 className="font-semibold text-primary-600 mb-2">
                    {verse.reference}
                  </h4>
                  <blockquote className="text-gray-700 italic mb-4 border-l-4 border-primary-200 pl-4">
                    "{verse.text}"
                  </blockquote>
                  <div className="text-sm text-gray-600">
                    <strong>Commentary:</strong>
                    <p className="mt-1">{verse.commentary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            <Button
              onClick={onStartOver}
              variant="outline"
            >
              <RefreshIcon className="w-4 h-4 mr-2" />
              Start Over
            </Button>
            
            {isAuthenticated ? (
              <Button
                onClick={onSave}
                disabled={isSaving}
                className="btn-primary"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Results'
                )}
              </Button>
            ) : (
              <Button
                onClick={onCreateAccount}
                className="btn-primary"
              >
                <UserPlusIcon className="w-4 h-4 mr-2" />
                Create Account to Save
              </Button>
            )}
          </div>

          {isAuthenticated && (
            <Button
              onClick={onGoToDashboard}
              className="btn-secondary"
            >
              Go to Dashboard
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}


