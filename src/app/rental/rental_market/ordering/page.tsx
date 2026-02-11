import React, { Suspense } from 'react';
import RentalOrderingContent from './RentalOrderingContent';

export default function RentalOrderingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RentalOrderingContent />
    </Suspense>
  );
}
