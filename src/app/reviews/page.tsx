"use client";
import React from "react";
import CustomerLayout from "@/app/components/customer/CustomerLayout";
import { testimonials as staticTestimonials } from '@/lib/testimonialsData';
import { Quote } from 'lucide-react';

export default function ReviewsPage() {
  const [published, setPublished] = React.useState<Array<{ quote: string; name: string; service?: string }>>([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('publishedTestimonials');
      if (raw) setPublished(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const all = [...staticTestimonials, ...published];

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-[#f8f6f6] p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold text-[#181111] mb-4">Customer Reviews</h1>
          <p className="text-gray-600 mb-8">Read verified reviews from customers who used our services. Browse, filter, and get inspired.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {all.map((t, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-md hover:shadow-2xl transition-all">
                <div className="text-primary/30 mb-4"><Quote className="w-8 h-8"/></div>
                <p className="text-gray-800 mb-4">"{t.quote}"</p>
                <div className="border-t pt-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#111111]">{t.name}</p>
                    {t.service && <p className="text-sm text-primary">{t.service}</p>}
                  </div>
                  <div className="text-xs text-gray-400">Verified</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
