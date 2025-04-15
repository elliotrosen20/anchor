import Link from 'next/link';
import Image from 'next/image';
import logo from '@/public/logo.svg';

export default function Home() {
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
        <Link 
          href="/chat"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Start a Session
        </Link>
      </div>
    </div>
  );
}