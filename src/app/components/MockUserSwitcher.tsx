"use client";
import React from "react";
import { MOCK_USERS, switchMockUser, getCurrentMockUser } from "@/lib/mockAuth";

export default function MockUserSwitcher() {
  const [currentUser, setCurrentUser] = React.useState(getCurrentMockUser());
  const [isOpen, setIsOpen] = React.useState(false);

  const handleUserSwitch = (userKey: keyof typeof MOCK_USERS) => {
    switchMockUser(userKey);
    setCurrentUser(getCurrentMockUser());
    setIsOpen(false);
    // Reload page to refresh data
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-medium text-gray-600">DEV MODE</span>
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
          <div className="text-xs text-gray-500">{currentUser.email}</div>
          <div className="text-xs font-medium mt-1">
            <span className={`px-2 py-0.5 rounded-full ${
              currentUser.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
              currentUser.role === 'CUSTOMER' ? 'bg-blue-100 text-blue-700' :
              'bg-green-100 text-green-700'
            }`}>
              {currentUser.role}
            </span>
          </div>
        </button>

        {isOpen && (
          <div className="mt-2 space-y-1">
            {Object.entries(MOCK_USERS).map(([key, user]) => (
              <button
                key={key}
                onClick={() => handleUserSwitch(key as keyof typeof MOCK_USERS)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  user.email === currentUser.email
                    ? 'bg-primary text-white'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs opacity-75">{user.email}</div>
                <div className="text-xs font-medium mt-1">
                  {user.role}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
