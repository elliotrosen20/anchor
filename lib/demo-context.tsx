'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
}

type DemoContextType = {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  lastMessage: Message | null;
  setLastMessage: React.Dispatch<React.SetStateAction<Message | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  addMessage: (message: Message) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
    setLastMessage(message);
  }, []);

  return (
    <DemoContext.Provider value={{ 
      messages, 
      setMessages, 
      lastMessage,
      setLastMessage,
      isLoading,
      setIsLoading,
      addMessage,
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoContext() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemoContext must be used within a DemoProvider');
  }
  return context;
}