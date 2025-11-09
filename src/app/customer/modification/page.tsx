"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { subscribeVehicles, type VehicleDoc } from '@/lib/vehicles';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LucideCheck, LucideX, LucideClock, LucideWrench, LucideAlertCircle, LucideTrash2 } from 'lucide-react';
import { createModification, listModificationsByUser, deleteModificationById, type ModificationDTO } from '@/lib/api/modifications';

type ModificationDoc = ModificationDTO;

export default function ServiceModification() {
  const { user, loading } = useAuth();
  const router = useRouter();
  // Simplified page: hero + request form only
  // Vehicle-based modification inquiry form state
  const [vehicles, setVehicles] = useState<VehicleDoc[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [inquiry, setInquiry] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [myModifications, setMyModifications] = useState<ModificationDoc[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeVehicles(user.uid, (items) => setVehicles(items));
    return () => unsub && unsub();
  }, [user]);

  // Fetch user's modification history from backend
  useEffect(() => {
    if (!user) {
      setHistoryLoading(false);
      return;
    }
    
    const fetchModifications = async () => {
      try {
        console.log('🔵 Fetching modifications for user:', user.uid);
        const list = await listModificationsByUser(user.uid);
        console.log('✅ Fetched modifications:', list);
        setMyModifications(list);
        setHistoryLoading(false);
      } catch (err: any) {
        console.error('❌ Modifications fetch error:', err);
        setMyModifications([]); // Clear on error
        setHistoryLoading(false);
      }
    };
    
    fetchModifications();
    // Poll every 5 seconds for updates
    const interval = setInterval(fetchModifications, 5000);
    return () => clearInterval(interval);
  }, [user]);

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

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const handleDeleteModification = async (modId: string) => {
    setDeletingId(modId);
    setDeleteConfirmId(null);
    try {
      await deleteModificationById(modId);
      // Refresh the list
      const list = await listModificationsByUser(user!.uid);
      setMyModifications(list);
      setSubmitMsg('✓ Modification request deleted successfully');
      setTimeout(() => setSubmitMsg(null), 3000);
    } catch (error: any) {
      console.error('Error deleting modification:', error);
      setSubmitErr(error?.message || 'Failed to delete request. Please try again.');
      setTimeout(() => setSubmitErr(null), 5000);
    } finally {
      setDeletingId(null);
    }
  };

  // (Removed old mock handlers and status helpers)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative w-full overflow-hidden bg-black">
        <div className="relative w-full h-[400px] md:h-[500px]">
          <img 
            src="https://res.cloudinary.com/dgyqfax25/image/upload/v1762481097/ChatGPT_Image_Nov_7_2025_07_30_26_AM_eegbwf.png"
            alt="Vehicle Modifications"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
            <div className="container mx-auto px-8">
              <div className="max-w-2xl">
                <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-4">
                  Vehicle Modifications
                </h1>
                <p className="text-white/90 text-lg md:text-xl font-normal leading-relaxed">
                  Customize your vehicle with our expert modification services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-10 pb-16">
        <div className="container mx-auto px-6">
          {/* Simple Vehicle Modification Inquiry */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-2">Request a Vehicle Modification</h2>
            <p className="text-muted-foreground mb-6">Choose one of your registered vehicles and describe the modification you want (e.g., stickering, bulb change).</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-foreground mb-2">Vehicle</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="" disabled>
                    {vehicles.length ? 'Select your vehicle' : 'No vehicles found'}
                  </option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {`${v.year} ${v.make} ${v.model} — ${v.numberPlate}`}
                    </option>
                  ))}
                </select>
                {/* Selected vehicle preview */}
                {selectedVehicleId && (
                  (() => {
                    const v = vehicles.find(x => x.id === selectedVehicleId);
                    if (!v) return null;
                    const img = v.photoURL || 'https://via.placeholder.com/400x200?text=No+Photo';
                    return (
                      <div className="mt-4 rounded-lg border border-gray-200 overflow-hidden">
                        <div
                          className="w-full h-40 bg-center bg-cover"
                          style={{ backgroundImage: `url('${img}')` }}
                        />
                        <div className="p-3">
                          <p className="text-sm text-gray-500">{v.numberPlate}</p>
                          <p className="text-sm font-semibold text-[#181111]">{v.year} {v.make} {v.model}</p>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-foreground mb-2">Topic</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Wheels / Body Kit / Paint"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 mb-4"
                />
                <label className="block text-sm font-semibold text-foreground mb-2">Your message</label>
                <textarea
                  rows={4}
                  value={inquiry}
                  onChange={(e) => setInquiry(e.target.value)}
                  placeholder="Describe your requested modification..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <button
                disabled={isProcessing || !selectedVehicleId || !subject.trim() || !inquiry.trim()}
                onClick={() => {
                  if (!user || !selectedVehicleId || !subject.trim() || !inquiry.trim() || isProcessing) return;
                  
                  console.log('🔵 Button clicked - starting submission');
                  setIsProcessing(true);
                  setSubmitting(true);
                  setSubmitMsg(null);
                  setSubmitErr(null);
                  
                  const vehicle = vehicles.find(v => v.id === selectedVehicleId);
                  console.log('🔵 Sending to backend...');
                  
                  createModification({
                    userId: user.uid,
                    vehicleId: selectedVehicleId,
                    vehicleLabel: vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model} — ${vehicle.numberPlate}` : undefined,
                    subject: subject.trim(),
                    message: inquiry.trim(),
                  })
                  .then(async (response) => {
                    console.log('✅ Modification created:', response.id);
                    // Refresh the list
                    const list = await listModificationsByUser(user.uid);
                    setMyModifications(list);
                    // Success! Clear everything
                    setSelectedVehicleId('');
                    setSubject('');
                    setInquiry('');
                    setSubmitMsg('✓ Your modification request has been submitted successfully! We will review it soon.');
                    setTimeout(() => setSubmitMsg(null), 8000);
                    console.log('✅ Success message set, form cleared');
                  })
                  .catch((e: any) => {
                    console.error('❌ Error submitting modification:', e);
                    setSubmitErr(e?.message || 'Failed to submit request. Please try again.');
                    setTimeout(() => setSubmitErr(null), 8000);
                  })
                  .finally(() => {
                    console.log('🔵 Finally block - resetting states');
                    setSubmitting(false);
                    setIsProcessing(false);
                    console.log('✅ States reset - submitting and isProcessing set to false');
                  });
                }}
                className={`px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors ${
                  (isProcessing || !selectedVehicleId || !subject.trim() || !inquiry.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? 'Submitting…' : 'Submit Request'}
              </button>
              {submitMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-4 rounded-lg bg-green-50 text-green-800 text-sm border-2 border-green-400 font-medium shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <LucideCheck size={20} className="text-green-600" />
                    <span>{submitMsg}</span>
                  </div>
                </motion.div>
              )}
              {submitErr && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-4 rounded-lg bg-red-50 text-red-800 text-sm border-2 border-red-400 font-medium shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <LucideX size={20} className="text-red-600" />
                    <span>{submitErr}</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* My Modification History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold font-heading text-foreground mb-4">My Modification History</h2>
            {historyLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading your history...</p>
              </div>
            ) : myModifications.length === 0 ? (
              <div className="text-center py-12">
                <LucideAlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">No modification requests yet</p>
                <p className="text-gray-500 text-sm mt-2">Submit your first request above to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myModifications.map((mod) => (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
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
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Submitted:</span> {formatDate(mod.createdAt)}
                        </p>
                      </div>
                      {/* Delete button - only show for pending requests */}
                      {mod.status === 'pending' && (
                        <button
                          onClick={() => setDeleteConfirmId(mod.id)}
                          disabled={deletingId === mod.id}
                          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete request"
                        >
                          {deletingId === mod.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                          ) : (
                            <LucideTrash2 size={20} />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{mod.message}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-red-100">
                <LucideTrash2 className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Modification Request</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this modification request? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteModification(deleteConfirmId)}
                disabled={deletingId === deleteConfirmId}
                className="flex-1 px-4 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingId === deleteConfirmId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

