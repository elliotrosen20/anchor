'use client';

import { useDemoContext } from '@/lib/demo-context';
import { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';

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

  const extractNotablePhrases = (messages: Message[]) => {
    const phrases: string[] = [];
    const keywords = ['compulsion', 'obsession', 'anxiety', 'trigger', 'exposure', 'checking', 'ritual', 'intrusive', 'worry', 'fear', 'contamination', 'reassurance', 'avoidance'];
    
    messages.forEach(msg => {
      const sentences = msg.content.split(/[.!?]+/);
      sentences.forEach(sentence => {
        const lowerSentence = sentence.toLowerCase();
        if (keywords.some(keyword => lowerSentence.includes(keyword))) {
          phrases.push(sentence.trim());
        }
      });
    });
    
    return [...new Set(phrases)].slice(0, 10); // Return unique phrases, limit to 10
  };

  const generateERPActionPlan = (messages: Message[]) => {
    const plan: string[] = [];
    const topics = new Set<string>();
    
    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      if (content.includes('contamination') || content.includes('germs')) {
        topics.add('contamination');
      }
      if (content.includes('checking') || content.includes('double-check')) {
        topics.add('checking');
      }
      if (content.includes('order') || content.includes('symmetry')) {
        topics.add('symmetry');
      }
      if (content.includes('intrusive') || content.includes('inappropriate thoughts')) {
        topics.add('intrusive thoughts');
      }
    });

    if (topics.has('contamination')) {
      plan.push('1. Gradual exposure to contamination triggers (start with mildly triggering situations)');
      plan.push('2. Practice delayed hand washing (increase time gradually)');
    }
    if (topics.has('checking')) {
      plan.push('3. Limit checking behaviors to once per situation');
      plan.push('4. Practice leaving situations without checking back');
    }
    if (topics.has('symmetry')) {
      plan.push('5. Intentionally create minor asymmetries');
      plan.push('6. Practice tolerating "imperfect" arrangements');
    }
    if (topics.has('intrusive thoughts')) {
      plan.push('7. Mindfulness practice to observe thoughts without engaging');
      plan.push('8. Write down intrusive thoughts without mental neutralizing');
    }

    if (plan.length === 0) {
      plan.push('1. Continue using the companion to identify specific OCD triggers');
      plan.push('2. Track anxiety levels during triggering situations');
      plan.push('3. Practice mindfulness and acceptance of uncertainty');
    }

    return plan;
  };

  const summarizeConversation = (messages: Message[]) => {
    let summary = '';
    const userMessages = messages.filter(m => m.role === 'user');
    
    if (userMessages.length === 0) return 'No conversation to summarize.';
    
    const topics = new Set<string>();
    const anxietyLevel = { current: 0, instances: 0 };
    
    userMessages.forEach(msg => {
      const content = msg.content.toLowerCase();
      if (content.includes('anxi') || content.includes('stress')) {
        anxietyLevel.instances++;
        const numbers = content.match(/\d+/g);
        if (numbers) {
          anxietyLevel.current = Math.max(anxietyLevel.current, parseInt(numbers[0]));
        }
      }
      
      if (content.includes('work') || content.includes('job')) topics.add('work/occupational concerns');
      if (content.includes('family') || content.includes('relationship')) topics.add('family/relationships');
      if (content.includes('sleep') || content.includes('tired')) topics.add('sleep concerns');
      if (content.includes('medication') || content.includes('therapy')) topics.add('treatment');
    });

    summary += `Session Overview:\n`;
    summary += `- Total exchanges: ${userMessages.length}\n`;
    summary += `- Main topics discussed: ${Array.from(topics).join(', ') || 'general OCD support'}\n`;
    if (anxietyLevel.instances > 0) {
      summary += `- Reported anxiety levels: highest at ${anxietyLevel.current}\n`;
    }
    
    return summary;
  };

  const handleExportSummary = () => {
    if (messages.length === 0) {
      alert('No conversation to export. Please send at least one message to generate a summary.');
      return;
    }

    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    
    const summary = summarizeConversation(messages);
    const erpPlan = generateERPActionPlan(messages);
    const notablePhrases = extractNotablePhrases(messages);

    const doc = new jsPDF();
    let currentY = 20;
    const lineHeight = 10;
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);

    const addText = (text: string, fontSize: number = 11, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (currentY + lineHeight > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
        }
        doc.text(line, margin, currentY);
        currentY += lineHeight;
      });
    };

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('OCD Companion Session Export', pageWidth / 2, 20, { align: 'center' });
    currentY = 40;

    addText(`Date: ${date} ${time}`, 11, true);
    addText(`Total Messages: ${messages.length}`, 11, true);
    currentY += 5;

    addText('CONVERSATION SUMMARY', 14, true);
    currentY += 5;
    addText(summary);
    currentY += 5;

    addText('RECOMMENDED ERP ACTION PLAN', 14, true);
    currentY += 5;
    erpPlan.forEach(item => {
      addText(item);
    });
    currentY += 5;

    addText('NOTABLE INSIGHTS', 14, true);
    currentY += 5;
    notablePhrases.forEach((phrase, i) => {
      addText(`${i + 1}. "${phrase}"`);
    });
    currentY += 10;

    addText('FULL CONVERSATION LOG', 14, true);
    currentY += 5;
    messages.forEach((msg, i) => {
      const speakerLabel = msg.role === 'user' ? 'USER' : 'COMPANION';
      addText(`[${i + 1}] ${speakerLabel}:`, 11, true);
      addText(msg.content);
      currentY += 3;
    });

    const footerY = pageHeight - margin;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Generated by OCD Companion - For treatment provider reference only', pageWidth / 2, footerY, { align: 'center' });

    doc.save(`ocd-companion-session-${date.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      <div className="flex justify-end items-center p-4 border-b">
        {/* <h2 className="text-lg font-semibold">OCD Companion Chat</h2> */}
        <button
          onClick={handleExportSummary}
          className="bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Export PDF for Provider
        </button>
      </div>
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