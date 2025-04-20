'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ChatSession, chatService } from './chat-service';

type ChatContextType = {
  sessions: ChatSession[];
  setSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  updateSessionOrder: (updatedSessionId: string) => void;
  refreshSessions: (userId: string) => Promise<void>;
  isHistoryLoading: boolean;
  setHistoryLoading: (isLoading: boolean) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isHistoryLoading, setHistoryLoading] = useState(false);

  const updateSessionOrder = (updatedSessionId: string) => {
    setSessions(prevSessions => {
      const updatedSession = prevSessions.find(session => session.id === updatedSessionId);
      
      if (!updatedSession) return prevSessions;

      const filteredSessions = prevSessions.filter(session => session.id !== updatedSessionId);
      
      return [
        {
          ...updatedSession,
          updatedAt: new Date().toISOString()
        },
        ...filteredSessions
      ];
    });
  };

  const refreshSessions = useCallback(async (userId: string) => {
    if (!userId) return;
    
    try {
      const updatedSessions = await chatService.getChatSessions(userId);
      setSessions(updatedSessions);
    } catch (error) {
      console.error('Error refreshing sessions:', error);
    }
  }, []);

  return (
    <ChatContext.Provider value={{ 
      sessions, 
      setSessions, 
      updateSessionOrder,
      refreshSessions,
      isHistoryLoading,
      setHistoryLoading,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}