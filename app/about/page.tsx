'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export default function AboutPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/chat');
    }
  }, [user, router])

  return (
    <div>
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="max-w-3xl w-full text-center">
          <h1 className="text-4xl font-bold mb-4">Why We&apos;re Different</h1>
          <p className="text-lg text-gray-700 mb-6">
            Not just another chatbot — this is a companion built with intention.
          </p>

          <div className="bg-white rounded-lg shadow-md p-6 text-left">
            <h2 className="text-2xl font-semibold mb-3">Science-Based Support</h2>
            <p className="mb-4 text-gray-600">
              Our responses are grounded in Cognitive Behavioral Therapy (CBT) and Exposure and Response Prevention (ERP),
              two of the most effective, evidence-based treatments for OCD.
            </p>

            <h2 className="text-2xl font-semibold mb-3">Always Available</h2>
            <p className="mb-4 text-gray-600">
              Unlike traditional therapy, this companion is available 24/7 — no appointments, no waitlists.
              Just help when you need it.
            </p>

            <h2 className="text-2xl font-semibold mb-3">Judgment-Free Zone</h2>
            <p className="mb-4 text-gray-600">
              You&apos;re not alone. Every intrusive thought you&apos;ve had — someone else has too.
              This space is here to support you with empathy, not judgment.
            </p>

            <h2 className="text-2xl font-semibold mb-3">Built With Care</h2>
            <p className="mb-4 text-gray-600">
              This isn&apos;t a general-purpose AI. It&apos;s a specialized tool designed with the nuances of OCD in mind,
              including the uncertainty, discomfort, and need for reassurance — all handled with therapeutic awareness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}