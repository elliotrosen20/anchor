'use client';

import { useDemoContext } from '@/lib/demo-context';
import { useState, useRef, useEffect } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

interface ChatBoxDemoProps {
  onVoiceModeToggle: () => void;
}

export default function ChatBox({ onVoiceModeToggle }: ChatBoxDemoProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, setIsLoading, addMessage } = useDemoContext();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage: Message = { role: 'user', content: input };
    addMessage(userMessage);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();

      setIsLoading(false);

      setTimeout(() => {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.content
        }

        addMessage(assistantMessage);
      }, 10)

    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      setTimeout(() => {
        addMessage({ 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.' 
        });
      }, 10)
    }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 my-8">
            <p>Welcome to your OCD companion.</p>
            <p>How are you feeling today?</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`${
                msg.role === 'user' 
                  ? 'ml-auto bg-blue-500 text-white' 
                  : 'mr-auto bg-gray-200 text-gray-800'
              } rounded-lg p-3 max-w-[80%]`}
            >
              {msg.content}
            </div>
          ))
        )}
        {isLoading && (
          <div className="mr-auto bg-gray-200 text-gray-800 rounded-lg p-3">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-2 flex justify-end">
        <div className="flex justify-between gap-3 items-center">
          <div>
            Talk to me instead?
          </div>
          <button
            onClick={onVoiceModeToggle}
            className="bg-blue-500 text-white rounded-full p-2"
            title="Switch to voice mode"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}