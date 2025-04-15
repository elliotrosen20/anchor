'use client';

import ChatBox from '../components/ChatBox';
import Image from 'next/image';
import Link from 'next/link';
import logo from '@/public/logo.svg';

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-200 p-4">
        <Link href="/" className="focus:outline-none">
          <div className="flex items-center">
            <Image
              src={logo}
              alt="App Logo"
              width={100}
              height={100}
            />
          </div>
        </Link>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <ChatBox />
      </main>
      
      <footer className="text-center p-4 text-sm text-gray-500">
        <p>This is an AI assistant and not a replacement for professional help.</p>
        <p>If you're in crisis, please contact a mental health professional.</p>
      </footer>
    </div>
  );
}