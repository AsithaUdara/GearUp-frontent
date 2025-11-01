"use client";
import React from "react";
import AdminLayout from "@/app/components/admin/AdminLayout";
import { LucideCreditCard, LucideStar, LucideUsers, LucideDollarSign } from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState({
    pendingPayments: 0,
    totalReviews: 0,
    publishedReviews: 0,
    totalRevenue: 0
  });

  React.useEffect(() => {
    // Load stats from localStorage
    try {
      const paymentsRaw = localStorage.getItem('adminPaymentRequests');
      const reviewsRaw = localStorage.getItem('customerReviews');

      if (paymentsRaw) {
        const payments = JSON.parse(paymentsRaw);
        const pending = payments.filter((p: any) => p.status === 'pending').length;
        const revenue = payments
          .filter((p: any) => p.status === 'approved')
          .reduce((sum: number, p: any) => sum + p.totalAmount, 0);
        
        setStats(prev => ({ ...prev, pendingPayments: pending, totalRevenue: revenue }));
      }

      if (reviewsRaw) {
        const reviews = JSON.parse(reviewsRaw);
        const published = reviews.filter((r: any) => r.publishedToLanding).length;
        setStats(prev => ({ ...prev, totalReviews: reviews.length, publishedReviews: published }));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <AdminLayout activeTab="Dashboard">
      <div className="flex flex-wrap justify-between gap-3 mb-6">
        <div className="flex min-w-72 flex-col gap-3">
          <p className="text-[#181111] text-4xl font-black leading-tight tracking-[-0.033em]">Admin Dashboard</p>
          <p className="text-gray-500 text-base font-normal leading-normal">
            Overview of payment approvals and reviews management
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Pending Payments</p>
              <p className="text-3xl font-bold text-[#181111]">{stats.pendingPayments}</p>
            </div>
            <div className="size-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <LucideCreditCard className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Reviews</p>
              <p className="text-3xl font-bold text-[#181111]">{stats.totalReviews}</p>
            </div>
            <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center">
              <LucideStar className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Published Reviews</p>
              <p className="text-3xl font-bold text-[#181111]">{stats.publishedReviews}</p>
            </div>
            <div className="size-12 rounded-full bg-green-100 flex items-center justify-center">
              <LucideUsers className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-[#181111]">${stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="size-12 rounded-full bg-purple-100 flex items-center justify-center">
              <LucideDollarSign className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-[#181111] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/admin/payments"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <LucideCreditCard className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-[#181111]">Approve Payments</h3>
                <p className="text-sm text-gray-600">Review and approve pending payment requests</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/reviews"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <LucideStar className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-[#181111]">Manage Reviews</h3>
                <p className="text-sm text-gray-600">Publish customer reviews to landing page</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </AdminLayout>
  );
}
