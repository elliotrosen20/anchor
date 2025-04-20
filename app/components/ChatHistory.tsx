'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { chatService, ChatSession } from '@/lib/chat-service';
import { useChatContext } from '@/lib/chat-context';

interface ChatHistoryProps {
  userId?: string;
  onSelectSession?: (sessionId: string) => void;
  currentSessionId?: string;
}

export default function ChatHistory({ 
  userId, 
  onSelectSession, 
  currentSessionId 
}: ChatHistoryProps = {}) {
  const { user } = useAuth();
  const { sessions, setSessions, refreshSessions, isHistoryLoading, setHistoryLoading } = useChatContext();

  const effectiveUserId = userId || user?.id;

  useEffect(() => {
    if (!currentSessionId || !effectiveUserId) return;
  
    const loadChatSessions = async () => {
      setHistoryLoading(true);
      try {
        await refreshSessions(effectiveUserId);
      } catch (error) {
        console.error('Failed to load chat sessions:', error);
      } finally {
        setHistoryLoading(false);
      }
    };
  
    loadChatSessions();
  }, [currentSessionId, refreshSessions]);

  if (isHistoryLoading) {
    return (
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  const handleClick = (sessionId: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onSelectSession) {
      e.preventDefault();
      onSelectSession(sessionId);
    }
  };

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!effectiveUserId) return;
    
    if (window.confirm('Are you sure you want to delete this conversation? This cannot be undone.')) {
      setHistoryLoading(true);
      
      const isLastChat = sessions.length === 1;
  
      if (isLastChat) {
        setHistoryLoading(true);
        
        try {
          await chatService.deleteChatSession(sessionId, effectiveUserId);
          
          const newSessionId = await chatService.createChatSession(effectiveUserId, 'New Chat');
          
          if (newSessionId) {
            if (onSelectSession) {
              onSelectSession(newSessionId);
            }
            
            await refreshSessions(effectiveUserId);
          }
        } catch (error) {
          console.error('Error in chat deletion/creation:', error);
        } finally {
          setHistoryLoading(false);
        }
      } else {
        setTimeout(async () => {
          const success = await chatService.deleteChatSession(sessionId, effectiveUserId);
          
          if (success) {
            const updatedSessions = sessions.filter(session => session.id !== sessionId);
            setSessions(updatedSessions);
            
            if (currentSessionId === sessionId && onSelectSession) {
              if (updatedSessions.length > 0) {
                onSelectSession(updatedSessions[0].id);
              } else {
                onSelectSession('');
              }
            }
          }
          
          setTimeout(() => {
            setHistoryLoading(false);
          }, 500);
        }, 50);
      }
    }
  };

  return (
    <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
      <ul>
        {sessions.map((session) => (
          <li
            key={session.id} 
            className="border-b last:border-b-0"
          >
            <div className="flex items-center justify-between group">
              <a
                href={`/chat?session=${session.id}`}
                className={`block p-4 w-full hover:bg-gray-100 transition ${
                  currentSessionId === session.id ? 'bg-blue-50' : ''
                }`}
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleClick(session.id, e)}
              >
                <div className="font-medium truncate">{session.title}</div>
                {session.lastMessage && (
                  <div className="text-sm text-gray-500 truncate">{session.lastMessage}</div>
                )}
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(session.updatedAt).toLocaleDateString()}
                </div>
              </a>
              <button
                onClick={(e) => handleDelete(session.id, e)}
                className="p-2 text-gray-400 hover:text-red-500 transition mr-2 opacity-0 group-hover:opacity-100"
                title="Delete conversation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
                  <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}