'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const DynamicLayout = dynamic(() => import('./DynamicLayout'), {
  ssr: false,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <DynamicLayout>{children}</DynamicLayout>
    </Suspense>
  );
}