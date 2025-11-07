"use client";
import React from "react";
import CustomerLayout from "@/app/components/customer/CustomerLayout";
import AdminFeedbackList from "@/app/components/admin/AdminFeedbackList";
import { Search } from 'lucide-react';

export default function AdminFeedbackPage() {
  const [query, setQuery] = React.useState('');

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-8">
        <div className="max-w-6xl mx-auto">
          <header className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-[#111827]">Admin — Feedbacks</h1>
              <p className="text-sm text-gray-600 mt-1">Review customer feedbacks and publish the best ones to the landing page.</p>
            </div>
            <div className="flex items-center gap-2">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search feedbacks" className="px-3 py-2 rounded-lg border border-gray-200" />
              <button className="px-4 py-2 rounded-lg bg-primary text-white">Filter</button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-2xl shadow">
                <AdminFeedbackList />
              </div>
            </div>

            <aside className="bg-white p-6 rounded-2xl shadow">
              <h3 className="font-bold text-lg mb-3">Published to Landing</h3>
              <PublishedList />
            </aside>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}

function PublishedList() {
  const [list, setList] = React.useState<Array<{ quote: string; name: string; service?: string }>>([]);
  React.useEffect(() => { try { const raw = localStorage.getItem('publishedTestimonials'); if (raw) setList(JSON.parse(raw)); } catch (e) {} }, []);
  return (
    <div className="space-y-3">
      {list.length === 0 && <p className="text-sm text-gray-500">No testimonials published yet.</p>}
      {list.map((t, i) => (
        <div key={i} className="p-3 border border-gray-100 rounded">
          <p className="text-sm text-gray-800">{t.quote.slice(0, 80)}{t.quote.length > 80 ? '...' : ''}</p>
          <p className="text-xs text-primary mt-1">{t.name} {t.service ? `• ${t.service}` : ''}</p>
        </div>
      ))}
    </div>
  );
}
