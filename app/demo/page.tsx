'use client';

import ChatBoxDemo from '../components/ChatBoxDemo';
import VoiceBoxDemo from '../components/VoiceBoxDemo';
import { useState } from 'react';
import { DemoProvider } from '@/lib/demo-context';

export default function DemoPage() {
  const [mode, setMode] = useState<'text' | 'voice'>('text');

  return (
    <DemoProvider>
      <div className="flex flex-col h-full">
        <div className="flex-1">
          {mode === 'text' ? (
            <ChatBoxDemo
              onVoiceModeToggle={() => setMode('voice')}
            />
          ) : (
            <VoiceBoxDemo
              onTextModeToggle={() => setMode('text')}
            />
          )}
        </div>
      </div>
    </DemoProvider>
  );
}