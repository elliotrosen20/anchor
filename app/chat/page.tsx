'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ChatPageContent = dynamic(() => import('./ChatPageContent'), {
  ssr: false,
});

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading chat...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}