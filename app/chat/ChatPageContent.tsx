'use client';

import ChatBox from '../components/ChatBox';
import { useEffect, useState } from 'react';
import VoiceBox from '../components/VoiceBox';
import { useAuth } from '@/lib/auth-context';
import { useSearchParams, useRouter } from 'next/navigation';
import { chatService } from '@/lib/chat-service';
import { useChatContext } from '@/lib/chat-context';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ChatPage() {
  const [mode, setMode] = useState<'text' | 'voice'>('voice');
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const urlSessionId = searchParams.get('session');
  const [sessionId, setSessionId] = useState<string>('');
  const router = useRouter();
  const { setSessions, isHistoryLoading } = useChatContext();

  useEffect(() => {
    const initializeSession = async () => {
      if (!user) return;
      
      const existingSessions = await chatService.getChatSessions(user.id);
      
      if (existingSessions.length > 0 && !urlSessionId) {
        setSessionId(existingSessions[0].id);
        setSessions(existingSessions);
        
        const url = new URL(window.location.href);
        url.searchParams.set('session', existingSessions[0].id);
        router.push(url.toString());
        return;
      }
      
      if (urlSessionId) {
        const sessionExists = existingSessions.some(session => session.id === urlSessionId);
        
        if (sessionExists) {
          setSessionId(urlSessionId);
        } else {
          createNewSession();
        }
      } else if (existingSessions.length === 0) {
        createNewSession();
      }
    };
    
    initializeSession();
  }, [user, urlSessionId]);

  const createNewSession = async () => {
    if (!user) return;
    
    try {
      const newSessionId = await chatService.createChatSession(user.id, 'New Chat');
      
      if (newSessionId) {
        setSessionId(newSessionId);

        const updatedSessions = await chatService.getChatSessions(user.id);
        setSessions(updatedSessions);
        
        const url = new URL(window.location.href);
        url.searchParams.set('session', newSessionId);
        router.push(url.toString());
      } else {
        console.error('Failed to create new session');
      }
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        {!isHistoryLoading ? (
          mode === 'text' ? (
            <ChatBox
              key={sessionId}
              sessionId={sessionId}
              onVoiceModeToggle={() => setMode('voice')}
            />
          ) : (
            <VoiceBox
              key={sessionId}
              sessionId={sessionId}
              onTextModeToggle={() => setMode('text')}
            />
          )
        ) : (
          <div className='flex-1 flex items-center justify-center h-full'>
            <LoadingSpinner />
          </div>
        )}
      </div>
    </div>
  );
}