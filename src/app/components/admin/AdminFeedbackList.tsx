"use client";
import React from "react";

type Feedback = {
  id: string;
  name: string;
  email?: string;
  message: string;
  rating?: number;
  service?: string;
  createdAt: string;
  published?: boolean;
  reply?: string;
};

export default function AdminFeedbackList() {
  const [list, setList] = React.useState<Feedback[]>(() => {
    // initialize with some mock entries or load from localStorage
    try {
      const raw = localStorage.getItem('adminFeedbacks');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [
      { id: 'f1', name: 'Alice R', email: 'alice@example.com', message: 'Great service, quick turnaround!', rating: 5, service: 'Oil Change', createdAt: '2025-09-12', published: false },
      { id: 'f2', name: 'Bob S', email: 'bob@example.com', message: 'Mechanic was friendly but waiting time long.', rating: 3, service: 'Brake inspection', createdAt: '2025-10-02', published: false }
    ];
  });

  React.useEffect(() => {
    localStorage.setItem('adminFeedbacks', JSON.stringify(list));
  }, [list]);

  function publishToLanding(f: Feedback) {
    // add to publishedTestimonials in localStorage
    try {
      const raw = localStorage.getItem('publishedTestimonials');
      const arr = raw ? JSON.parse(raw) : [];
      arr.unshift({ quote: f.message, name: f.name, service: f.service });
      localStorage.setItem('publishedTestimonials', JSON.stringify(arr));
      setList((prev) => prev.map((item) => (item.id === f.id ? { ...item, published: true } : item)));
    } catch (e) {
      console.error(e);
    }
  }

  function replyToFeedback(id: string, reply: string) {
    setList((prev) => prev.map((f) => (f.id === id ? { ...f, reply } : f)));
  }

  function removeFeedback(id: string) {
    setList((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div className="space-y-4">
      {list.map((f) => (
        <div key={f.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-[#181111]">{f.name} <span className="text-xs text-gray-400">• {f.service}</span></p>
              <p className="text-sm text-gray-600 mt-1">{f.message}</p>
              {f.reply && <div className="mt-2 p-2 bg-green-50 text-green-800 rounded">Reply: {f.reply}</div>}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-xs text-gray-500">{f.createdAt}</div>
              <div className="flex gap-2">
                {!f.published && <button onClick={() => publishToLanding(f)} className="px-3 py-1 rounded bg-primary text-white text-sm">Publish</button>}
                <button onClick={() => {
                  const r = prompt('Write a reply to this feedback (this will be saved locally):', f.reply || '');
                  if (r !== null) replyToFeedback(f.id, r);
                }} className="px-3 py-1 rounded border border-gray-200 text-sm">Reply</button>
                <button onClick={() => { if (confirm('Delete feedback?')) removeFeedback(f.id); }} className="px-3 py-1 rounded border border-red-200 text-sm text-red-600">Delete</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
