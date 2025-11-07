"use client";

import { useEffect, useState } from "react";
import ChatWindow from "./ChatWindow";
import ContactList from "./ContactList";
import { fetchTasksByEmployeeId, WorkTask } from "@/lib/workScheduleData";

interface Contact {
  id: string;
  name: string;
  role: string; // we'll store service type + vehicle here
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
}

export default function CommunicationPage() {
  const employeeId = "emp-1"; // derive from auth when available

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messagesByContact, setMessagesByContact] = useState<Record<string, Message[]>>({});

  useEffect(() => {
    let mounted = true;
    fetchTasksByEmployeeId(employeeId).then(({ assigned }) => {
      if (!mounted) return;
      const avatarPool = [11, 12, 13, 14, 15, 16, 17, 18];
      const mappedContacts: Contact[] = assigned.map((t: WorkTask, idx: number) => ({
        id: t.serviceId, // unique per service -> uniquely identifies customer thread
        name: t.customer,
        role: `${t.serviceType} • ${t.vehicle}`,
        avatar: `https://i.pravatar.cc/80?img=${avatarPool[idx % avatarPool.length]}`,
        lastMessage: "",
        timestamp: t.time ?? "",
        unreadCount: 0,
        isOnline: idx % 3 !== 0, // most appear online
      }));
      setContacts(mappedContacts);
      setSelectedContact(mappedContacts[0] ?? null);
      // initialize message threads with mock conversation
      setMessagesByContact((prev) => {
        const next = { ...prev } as Record<string, Message[]>;
        mappedContacts.forEach((c, idx) => {
          if (!next[c.id]) {
            next[c.id] = [
              {
                id: `${c.id}-1`,
                senderId: c.id,
                content: `Hi, this is ${c.name}. Any update on my ${c.role.split(" • ")[0]}?`,
                timestamp: "10:05 AM",
                type: "text",
              } as Message,
              {
                id: `${c.id}-2`,
                senderId: "current",
                content: "Hi! We started work and will keep you posted.",
                timestamp: "10:07 AM",
                type: "text",
              } as Message,
              ...(idx % 2 === 0
                ? [
                    {
                      id: `${c.id}-3`,
                      senderId: c.id,
                      content: "Great, please share a photo once complete.",
                      timestamp: "10:09 AM",
                      type: "text",
                    } as Message,
                  ]
                : []),
            ];
          }
        });
        return next;
      });
    });
    return () => {
      mounted = false;
    };
  }, [employeeId]);

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setContacts(prev => prev.map(c => (c.id === contact.id ? { ...c, unreadCount: 0 } : c)));
  };

  const handleSendMessage = (content: string) => {
    if (!selectedContact) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "current",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "text"
    };

    setMessagesByContact(prev => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMessage]
    }));

    setContacts(prev =>
      prev.map(c => (c.id === selectedContact.id ? { ...c, lastMessage: content, timestamp: "now" } : c))
    );
  };

  const currentMessages = selectedContact ? (messagesByContact[selectedContact.id] || []) : [];

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Contact List - Left Side */}
      <div className="w-80 bg-white border-r border-gray-200 h-screen">
        <ContactList 
          contacts={contacts}
          selectedContact={selectedContact as any}
          onContactSelect={handleContactSelect}
        />
      </div>
      
      {/* Chat Window - Right Side */}
      <div className="flex-1 h-screen">
        {selectedContact ? (
          <ChatWindow 
            contact={selectedContact as any}
            messages={currentMessages}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">No assigned customers</div>
        )}
      </div>
    </div>
  );
}