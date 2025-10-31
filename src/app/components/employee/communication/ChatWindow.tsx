"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Send, Paperclip, Smile, Phone, Video, MoreVertical } from "lucide-react";

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

interface ChatWindowProps {
  contact: Contact;
  messages: Message[];
  onSendMessage: (content: string) => void;
}

export default function ChatWindow({ contact, messages, onSendMessage }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                src={contact.avatar}
                alt={contact.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              {contact.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{contact.name}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                {contact.isOnline ? (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Online
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    Offline
                  </>
                )} • {contact.role}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
              <Phone className="h-5 w-5 text-gray-600 group-hover:text-red-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
              <Video className="h-5 w-5 text-gray-600 group-hover:text-red-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
              <MoreVertical className="h-5 w-5 text-gray-600 group-hover:text-red-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === 'current' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
              message.senderId === 'current'
                ? 'bg-red-600 text-white rounded-br-md'
                : 'bg-black text-white border border-gray-800 rounded-bl-md'
            }`}>
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className={`text-xs mt-2 ${
                message.senderId === 'current' ? 'text-red-100' : 'text-gray-300'
              }`}>
                {message.timestamp}
                {message.senderId === 'current' && (
                  <span className="ml-2">
                    <svg className="inline w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl border border-gray-200 rounded-bl-md">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {/* Quick Response Buttons */}
        <div className="flex gap-2 mb-3 overflow-x-auto">
          <button
            onClick={() => onSendMessage("Thanks for the update!")}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors whitespace-nowrap"
          >
            👍 Thanks!
          </button>
          <button
            onClick={() => onSendMessage("On my way")}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors whitespace-nowrap"
          >
            🚗 On my way
          </button>
          <button
            onClick={() => onSendMessage("Task completed")}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors whitespace-nowrap"
          >
            ✅ Completed
          </button>
          <button
            onClick={() => onSendMessage("Will do!")}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors whitespace-nowrap"
          >
            👌 Will do
          </button>
        </div>
        
        <div className="flex items-end gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
            <Paperclip className="h-5 w-5 text-gray-600 group-hover:text-red-600" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
              style={{
                maxHeight: '120px',
                minHeight: '48px'
              }}
            />
            {newMessage.trim() && (
              <div className="absolute bottom-2 right-2">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
            <Smile className="h-5 w-5 text-gray-600 group-hover:text-red-600" />
          </button>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`p-3 rounded-full transition-all duration-200 ${
              newMessage.trim()
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            Press Enter to send, Shift + Enter for new line
          </p>
          {isTyping && (
            <p className="text-xs text-red-600 animate-pulse">
              Typing...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}