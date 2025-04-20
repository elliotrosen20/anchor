'use client';

import Link from 'next/link';
import Image from 'next/image';
import logo from '@/public/logo.svg';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  console.log("Home page rendering. Auth state:", { user, isLoading });

  if (user) {
    return (
      <div className="min-h-screen flex flex-col">        
        <div className="flex-1 container mx-auto p-4 md:p-8 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
            <p className="text-gray-600 mb-6">How are you feeling today?</p>
            
            <div className="flex flex-col md:flex-row gap-4">
              <Link 
                href="/chat" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium text-center"
              >
                Start a new conversation
              </Link>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">How We Help</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Personalized CBT-based conversations</li>
              <li>Real-time exposure therapy support</li>
              <li>Anxiety management techniques</li>
              <li>24/7 non-judgmental companion</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">OCD Management Tips</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Practice 4-7-8 breathing and grounding for any anxiety</li>
              <li>Use your companion to talk through proper OCD protocols</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-[10px]">
          <Image
            src={logo}
            alt="Anchor Logo"
            width={150}
            height={150}
            className="mr-3"
          />
        </div>
        <h1 className="text-4xl font-bold mb-6">Your Companion for OCD</h1>
        <p className="mb-8">
          A supportive AI companion to help with OCD management using science and evidence-based approaches.
        </p>
        <div className="space-y-4">
          {!isLoading && (
            user ? (
              <Link 
                href="/chat"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition block"
              >
                Let's talk
              </Link>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition block"
                >
                  Log in
                </Link>
                <Link 
                  href="/signup"
                  className="bg-white border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition block"
                >
                  Sign up
                </Link>
                <Link 
                  href="/demo"
                  className="bg-white border border-blue-400 text-blue-500 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition block"
                >
                  Try a demo
                </Link>
              </>
            )
          )}
        </div>
        <div className='mt-20'>
          <Link 
            href="/about"
            className="font-medium transition hover:underline"
          >
            Why is this different?
          </Link>
        </div>
      </div>
    </div>
  );
}