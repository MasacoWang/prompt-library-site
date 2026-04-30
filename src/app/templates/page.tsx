import { Suspense } from 'react';
import TemplatesHub from '@/components/TemplatesHub';

export default function TemplatesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-mesh flex items-center justify-center"><p className="text-text-muted">Loading...</p></div>}>
      <TemplatesHub />
    </Suspense>
  );
}
