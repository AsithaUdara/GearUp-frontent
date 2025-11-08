// src/app/employee/parts-request/page.tsx
import PartsRequest from '@/app/components/employee/parts/PartsRequest';
import React from 'react';

const PartsRequestPage = () => {
  return (
    <main className="p-3 sm:p-4 lg:p-5">
      <div className="max-w-7xl mx-auto">
        <PartsRequest />
      </div>
    </main>
  );
};

export default PartsRequestPage;