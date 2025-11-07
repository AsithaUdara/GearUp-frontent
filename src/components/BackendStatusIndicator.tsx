'use client';
import { useState, useEffect } from 'react';
import { checkBackendHealth } from '@/services/appointmentService';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function BackendStatusIndicator() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      setIsChecking(true);
      try {
        const connected = await checkBackendHealth();
        setIsConnected(connected);
      } catch (error) {
        console.error('Backend status check failed:', error);
        setIsConnected(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Initial check
    checkConnection();
    
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isChecking && isConnected === null) {
    return (
      <div className="fixed bottom-4 right-4 p-3 rounded-lg shadow-lg bg-blue-100 text-blue-800">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">Checking service...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 p-3 rounded-lg shadow-lg ${
      isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      <div className="flex items-center space-x-2">
        {isConnected ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">
          {isConnected ? 'Service Online' : 'Service Offline'}
        </span>
      </div>
    </div>
  );
}