'use client';

import { useAuth } from '@/lib/auth-context';
import UserProfile from '../components/UserProfile';
import ChatHistory from '../components/ChatHistory';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { chatService } from '@/lib/chat-service';
import { useChatContext } from '@/lib/chat-context';

export default function DynamicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSessionId = searchParams.get('session') || '';
  const { refreshSessions, setHistoryLoading } = useChatContext();

  useEffect(() => {
    const initializeSidebar = async () => {
      if (user?.id) {
        setHistoryLoading(true);
        try {
          await refreshSessions(user.id);
        } finally {
          setHistoryLoading(false);
        }
      }
    };
  
    initializeSidebar();
  }, [user?.id, refreshSessions, setHistoryLoading]);

  const handleSessionSelect = (sessionId: string) => {
    if (sessionId) {
      router.push(`/chat?session=${sessionId}`);
    } else {
      handleNewChat();
    }
  };

  const handleNewChat = async () => {
    if (!user) return;
    
    setHistoryLoading(true);

    const chatName = prompt("Name your new chat:", "New Chat");
    const finalChatName = chatName || "New Chat";
    
    setTimeout(async () => {
      const newSessionId = await chatService.createChatSession(user.id, finalChatName);
      if (newSessionId) {
        await refreshSessions(user.id);
        
        router.push(`/chat?session=${newSessionId}`);
        
        setTimeout(() => {
          setHistoryLoading(false);
        }, 500);
      } else {
        setTimeout(() => {
          setHistoryLoading(false);
        }, 500);
      }
    }, 50);
  };

  return (
    <div className="flex h-screen">
      <div
        className="w-64 bg-white border-r flex flex-col overflow-hidden"
      > 
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            New Chat
          </button>
        </div>
        <h2 className="font-semibold p-4 border-b">Your Conversations</h2>
        <ChatHistory 
          userId={user?.id}
          onSelectSession={handleSessionSelect}
          currentSessionId={currentSessionId}
        />
      </div>
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-100 p-4 border-b flex justify-between items-center">
          <div className="text-lg font-medium">OCD Companion</div>
          <UserProfile />
        </header>
        <main className="flex-1 overflow-hidden">
            <div
              key={currentSessionId}
              className="h-full"
            >
              {children}
            </div>
        </main>
      </div>
    </div>
  );
}