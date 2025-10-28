"use client";

import { useState } from "react";
import ChatWindow from "./ChatWindow";
import ContactList from "./ContactList";

interface Contact {
  id: string;
  name: string;
  role: string;
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
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      role: "Service Manager",
      avatar: "https://i.pravatar.cc/80?img=1",
      lastMessage: "Service update for SVC-2024-00789",
      timestamp: "2 min ago",
      unreadCount: 2,
      isOnline: true
    },
    {
      id: "2",
      name: "Mike Chen",
      role: "Senior Technician",
      avatar: "https://i.pravatar.cc/80?img=3",
      lastMessage: "Parts are ready for pickup",
      timestamp: "15 min ago",
      unreadCount: 0,
      isOnline: true
    },
    {
      id: "3",
      name: "Lisa Rodriguez",
      role: "Customer Service",
      avatar: "https://i.pravatar.cc/80?img=5",
      lastMessage: "Customer called about their vehicle",
      timestamp: "1 hour ago",
      unreadCount: 1,
      isOnline: false
    },
    {
      id: "4",
      name: "David Wilson",
      role: "Parts Manager",
      avatar: "https://i.pravatar.cc/80?img=7",
      lastMessage: "Brake pads inventory updated",
      timestamp: "2 hours ago",
      unreadCount: 0,
      isOnline: true
    }
  ]);

  const [selectedContact, setSelectedContact] = useState<Contact>(contacts[0]);
  
  const [messagesByContact, setMessagesByContact] = useState<Record<string, Message[]>>({
    "1": [
      {
        id: "1",
        senderId: "1",
        content: "Hi! I need an update on the brake pad replacement for SVC-2024-00789",
        timestamp: "10:30 AM",
        type: "text"
      },
      {
        id: "2",
        senderId: "current",
        content: "Sure! I'm currently installing the new brake pads. Should be done in about 30 minutes.",
        timestamp: "10:32 AM",
        type: "text"
      },
      {
        id: "3",
        senderId: "1",
        content: "Great! Please let me know when it's completed so I can update the customer.",
        timestamp: "10:33 AM",
        type: "text"
      },
      {
        id: "4",
        senderId: "current",
        content: "Will do! I'll also send you photos of the completed work.",
        timestamp: "10:35 AM",
        type: "text"
      }
    ],
    "2": [
      {
        id: "5",
        senderId: "2",
        content: "The brake parts for the Toyota Camry have arrived",
        timestamp: "9:45 AM",
        type: "text"
      },
      {
        id: "6",
        senderId: "current",
        content: "Perfect! I'll pick them up in 5 minutes",
        timestamp: "9:46 AM",
        type: "text"
      }
    ],
    "3": [
      {
        id: "7",
        senderId: "3",
        content: "Mrs. Smith called asking about the status of her vehicle",
        timestamp: "8:30 AM",
        type: "text"
      }
    ],
    "4": [
      {
        id: "8",
        senderId: "4",
        content: "Updated the brake pad inventory. We're well stocked for this week.",
        timestamp: "7:15 AM",
        type: "text"
      }
    ]
  });

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    // Mark messages as read for this contact
    setContacts(prev => 
      prev.map(c => 
        c.id === contact.id ? { ...c, unreadCount: 0 } : c
      )
    );
  };

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "current",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "text"
    };
    
    // Add message to the selected contact's conversation
    setMessagesByContact(prev => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMessage]
    }));
    
    // Update the last message in contacts list
    setContacts(prev =>
      prev.map(c =>
        c.id === selectedContact.id
          ? { ...c, lastMessage: content, timestamp: "now" }
          : c
      )
    );
  };

  const currentMessages = messagesByContact[selectedContact?.id] || [];

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Contact List - Left Side */}
      <div className="w-80 bg-white border-r border-gray-200 h-screen">
        <ContactList 
          contacts={contacts}
          selectedContact={selectedContact}
          onContactSelect={handleContactSelect}
        />
      </div>
      
      {/* Chat Window - Right Side */}
      <div className="flex-1 h-screen">
        <ChatWindow 
          contact={selectedContact}
          messages={currentMessages}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}