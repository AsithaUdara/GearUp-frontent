// src/app/dashboard/page.tsx
'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [secureMessage, setSecureMessage] = useState('');
  const [publicMessage, setPublicMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }

    const fetchApiData = async () => {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8080';
      try {
        const publicRes = await fetch(`${base}/api/public/hello`);
        const publicData = await publicRes.text();
        setPublicMessage(publicData);
      } catch {
        setPublicMessage('Failed to connect to public backend endpoint.');
      }

      if (user) {
        try {
          const token = await user.getIdToken();
          const secureRes = await fetch(`${base}/api/secure/hello`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

            if (secureRes.ok) {
              const secureData = await secureRes.text();
              setSecureMessage(secureData);
            } else {
              setError('Failed to fetch secure data. Your token might be invalid.');
            }
        } catch {
          setError('An error occurred while fetching secure data.');
        }
      }
    };

    fetchApiData();
  }, [user, loading, router]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><h1>Loading...</h1></div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-8 mt-24">
      <h1 className="text-4xl font-bold font-heading">Customer Dashboard</h1>
      <p className="mt-4 text-lg">Welcome, <span className="font-bold text-primary">{user.email}</span>!</p>
      <div className="mt-8 p-6 border rounded-lg bg-gray-50 space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Backend API Test Results:</h2>
        </div>
        <div>
          <strong>Public Endpoint:</strong>
          <p className="p-2 bg-gray-200 rounded mt-1">{publicMessage}</p>
        </div>
        <div>
          <strong>Secure Endpoint:</strong>
          {secureMessage && <p className="p-2 bg-green-100 text-green-800 rounded mt-1">{secureMessage}</p>}
          {error && <p className="p-2 bg-red-100 text-red-800 rounded mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}
