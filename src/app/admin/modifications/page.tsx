"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { LucideCheck, LucideX, LucideClock, LucideWrench, LucideAlertCircle } from 'lucide-react';

type ModificationDoc = {
  id: string;
  userId: string;
  vehicleId: string;
  vehicleLabel?: string | null;
  subject?: string | null;
  message: string;
  status: "pending" | "approved" | "in_progress" | "completed" | "rejected";
  createdAt?: { seconds: number; nanoseconds: number } | null;
};

export default function AdminModifications() {
  const [modifications, setModifications] = useState<ModificationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected'>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'modifications'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list: ModificationDoc[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setModifications(list);
      setLoading(false);
    }, (err) => {
      console.error("modifications listener error", err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateStatus = async (modId: string, newStatus: ModificationDoc['status']) => {
    setUpdating(modId);
    try {
      await updateDoc(doc(db, 'modifications', modId), { status: newStatus });
    } catch (e) {
      console.error('Failed to update status:', e);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const filteredMods = filter === 'all' 
    ? modifications 
    : modifications.filter(m => m.status === filter);

  const getStatusBadge = (status: ModificationDoc['status']) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium"><LucideClock size={14} />Pending</span>;
      case 'approved':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"><LucideCheck size={14} />Approved</span>;
      case 'in_progress':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium"><LucideWrench size={14} />In Progress</span>;
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium"><LucideCheck size={14} />Completed</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium"><LucideX size={14} />Rejected</span>;
      default:
        return <span className="text-gray-500 text-xs">{status}</span>;
    }
  };

  const formatDate = (timestamp?: { seconds: number; nanoseconds: number } | null) => {
    if (!timestamp || typeof timestamp.seconds !== 'number') return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vehicle Modification Requests</h1>
              <p className="text-gray-600 mt-2">Review and manage customer modification requests</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Filter:</span>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All ({modifications.length})</option>
                <option value="pending">Pending ({modifications.filter(m => m.status === 'pending').length})</option>
                <option value="approved">Approved ({modifications.filter(m => m.status === 'approved').length})</option>
                <option value="in_progress">In Progress ({modifications.filter(m => m.status === 'in_progress').length})</option>
                <option value="completed">Completed ({modifications.filter(m => m.status === 'completed').length})</option>
                <option value="rejected">Rejected ({modifications.filter(m => m.status === 'rejected').length})</option>
              </select>
            </div>
          </div>

          {filteredMods.length === 0 ? (
            <div className="text-center py-12">
              <LucideAlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No modification requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMods.map((mod) => (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {mod.subject || 'Vehicle Modification'}
                        </h3>
                        {getStatusBadge(mod.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Vehicle:</span> {mod.vehicleLabel || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">User ID:</span> {mod.userId}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Submitted:</span> {formatDate(mod.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{mod.message}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {mod.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(mod.id, 'approved')}
                          disabled={updating === mod.id}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <LucideCheck size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(mod.id, 'rejected')}
                          disabled={updating === mod.id}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <LucideX size={16} />
                          Reject
                        </button>
                      </>
                    )}
                    {mod.status === 'approved' && (
                      <button
                        onClick={() => updateStatus(mod.id, 'in_progress')}
                        disabled={updating === mod.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <LucideWrench size={16} />
                        Mark In Progress
                      </button>
                    )}
                    {mod.status === 'in_progress' && (
                      <button
                        onClick={() => updateStatus(mod.id, 'completed')}
                        disabled={updating === mod.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <LucideCheck size={16} />
                        Mark Completed
                      </button>
                    )}
                    {(mod.status === 'completed' || mod.status === 'rejected') && (
                      <button
                        onClick={() => updateStatus(mod.id, 'pending')}
                        disabled={updating === mod.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <LucideClock size={16} />
                        Reopen
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
