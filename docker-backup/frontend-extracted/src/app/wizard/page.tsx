import { Suspense } from 'react';
import WizardPage from '@/components/pages/WizardPage';
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Wizard() {
  return (
    <Suspense fallback={<PageLoadingSpinner />}>
      <WizardPage />
    </Suspense>
  );
}


