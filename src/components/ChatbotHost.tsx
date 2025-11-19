"use client";
import { usePathname } from 'next/navigation';
import { Chatbot } from './Chatbot';

export default function ChatbotHost() {
  const pathname = usePathname();
  // Hide chatbot on admin routes
  if (pathname && pathname.startsWith('/admin')) return null;
  return <Chatbot />;
}
