import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/lib/auth-context';
import { ChatProvider } from "@/lib/chat-context";
import NavBar from "./components/NavBar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "OCD Companion",
  description: "Your AI companion for OCD management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <AuthProvider>
          <ChatProvider>
            <NavBar />
            {children}
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
