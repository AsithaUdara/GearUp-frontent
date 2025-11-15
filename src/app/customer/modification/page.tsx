"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Car, 
  Wrench, 
  User, 
  Phone, 
  MapPin,
  Calendar,
  Timer,
  FileText,
  Camera,
  MessageSquare,
  RefreshCw,
  Bell,
  Plus,
  Edit,
  Trash2,
  Send,
  DollarSign,
  AlertTriangle,
  CheckSquare,
  XCircle,
  Loader2,
  Clock as LucideClock,
  Check as LucideCheck,
  Wrench as LucideWrench,
  X as LucideX
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getModificationServices, createModificationRequest, ModificationService as BackendModificationService } from '@/services/modificationService';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export default function ModificationRedirect() {
  const router = useRouter();
  // Remove mock data - we'll show only available services and submission form
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [availableServices, setAvailableServices] = useState<BackendModificationService[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [myModifications, setMyModifications] = useState<ModificationDoc[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    selectedServiceId: 0,
    customerName: user?.displayName || '',
    customerEmail: user?.email || '',
    customerPhone: '',
    customerAddress: '',
    preferredDate: ''
  });

  const dummyServices = [
    {
      id: 1,
      name: 'Custom Paint Finish',
      description: 'Premium body prep with multi-layer custom colour and ceramic protection.',
      estimatedDurationHours: 12,
      basePrice: 145000
    },
    {
      id: 2,
      name: 'Performance ECU Tune',
      description: 'Dyno-tested ECU remap for improved horsepower and throttle response.',
      estimatedDurationHours: 6,
      basePrice: 88000
    },
    {
      id: 3,
      name: 'Interior Detailing & Upholstery',
      description: 'Full cabin detailing with custom leather or Alcantara upholstery upgrade.',
      estimatedDurationHours: 10,
      basePrice: 120000
    }
  ];

  
   useEffect(() => {
     if (!loading && !user) {
       router.push('/');
     }
  }, [user, loading, router]);

  // Fetch available modification services from backend
  useEffect(() => {
    const fetchServices = async () => {
      
       if (!user) return;
      
      setLoadingServices(true);
      try {
        const response = await getModificationServices();
        if (response.success && response.data) {
          setAvailableServices(response.data);
        } else {
          setError(response.error || 'Failed to load services');
        }
      } catch (err) {
        setError('Error loading modification services');
      } finally {
        setLoadingServices(false);
      }
    };

    
     if (user) {
      fetchServices();
     }
  }, [user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleSubmitRequest = async () => {
    if (!user) {
      setError('You must be logged in to submit a modification request');
      return;
    }

    if (!newRequest.title || !newRequest.title.trim()) {
      setError('Please specify the modification service type');
      return;
    }

    if (!newRequest.description || !newRequest.description.trim()) {
      setError('Please describe your modification requirements');
      return;
    }

    if (!newRequest.customerName || !newRequest.customerEmail || !newRequest.customerPhone) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmittingRequest(true);
    setError(null);

    try {
      // Use selectedServiceId if clicked from a card, otherwise use 1 as default service
      const serviceId = newRequest.selectedServiceId > 0 ? newRequest.selectedServiceId : 1;
      
      const response = await createModificationRequest({
        serviceId: serviceId,
        customerName: newRequest.customerName,
        customerEmail: newRequest.customerEmail,
        customerPhone: newRequest.customerPhone,
        customerAddress: newRequest.customerAddress,
        preferredDate: newRequest.preferredDate,
        notes: `${newRequest.title}\n\n${newRequest.description}`
      });

      if (response.success) {
        setSuccess('Modification request submitted successfully! We will contact you soon.');

        // Reset form
        setNewRequest({
          title: '',
          description: '',
          selectedServiceId: 0,
          customerName: user?.displayName || '',
          customerEmail: user?.email || '',
          customerPhone: '',
          customerAddress: '',
          preferredDate: ''
        });
        setShowNewRequest(false);

        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(response.error || 'Failed to submit modification request');
      }
    } catch (err) {
      setError('Error submitting modification request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Fetch user's modification history from Firestore (temporary until backend ready)
  useEffect(() => {
    if (!user) {
      setHistoryLoading(false);
      return;
    }
    const q = query(
      collection(db, 'modifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: ModificationDoc[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setMyModifications(list);
        setHistoryLoading(false);
      },
      (err) => {
        console.error('modifications history error', err);
        setHistoryLoading(false);
      }
    );
    return () => unsub();
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

  const formatDate = (timestamp?: { seconds: number; nanoseconds: number } | null) => {
    if (!timestamp || typeof timestamp.seconds !== 'number') return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // (Removed old mock handlers and status helpers)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              {success}
            </motion.div>
          )}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold font-heading text-foreground mb-4">
              Service Modifications
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Request changes to your ongoing service. Add, remove, or modify services as needed.
            </p>
          </motion.div>

          {/* Temporarily hiding the service tracking view - will implement with real backend data later */}
          {/* Service Overview section commented out - requires appointment context */}

          <div className="grid grid-cols-1 gap-8">
            {/* Available Services - Clickable Cards */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-lg p-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold font-heading text-foreground">Available Modification Services</h3>
                  <button
                    onClick={() => setShowNewRequest(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Request Custom Modification
                  </button>
                </div>

                {loadingServices ? (
                  <p className="text-center text-muted-foreground">Loading services...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(availableServices.length > 0 ? availableServices : dummyServices).map((service) => (
                      <motion.div
                        key={service.id}
                        whileHover={{ y: -4, scale: 1.02 }}
                        onClick={() => {
                          setNewRequest(prev => ({
                            ...prev,
                            selectedServiceId: service.id,
                            title: service.name,
                            description: service.description
                          }));
                          setShowNewRequest(true);
                        }}
                        className="p-6 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-primary/10 rounded-full">
                            <Wrench className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-foreground mb-1">{service.name}</h4>
                            <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Timer className="h-4 w-4" />
                                {service.estimatedDurationHours}h
                              </span>
                              <span className="text-primary font-semibold">
                                LKR {service.basePrice.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

              

              
            
          </div>
        </div>
      </div>

      {/* New Request Modal */}
      <AnimatePresence>
        {showNewRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl my-8"
            >
              <h3 className="text-2xl font-bold font-heading text-foreground mb-6">Request Vehicle Modification</h3>
              
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Modification Service Type *
                  </label>
                  <input
                    type="text"
                    value={newRequest.title}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g., Custom Paint Job, Performance Upgrade, Custom Exhaust..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Type the modification you need or click a service card above to auto-fill
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Modification Details *
                  </label>
                  <textarea
                    value={newRequest.description}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Describe your modification requirements in detail..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Your Name *</label>
                    <input
                      type="text"
                      value={newRequest.customerName}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, customerName: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Email *</label>
                    <input
                      type="email"
                      value={newRequest.customerEmail}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, customerEmail: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={newRequest.customerPhone}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, customerPhone: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="077 123 4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Preferred Date</label>
                    <input
                      type="date"
                      value={newRequest.preferredDate}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, preferredDate: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Address</label>
                  <input
                    type="text"
                    value={newRequest.customerAddress}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, customerAddress: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="123 Main Street, Colombo"
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end mt-8">
                <button
                  onClick={() => {
                    setShowNewRequest(false);
                    setError(null);
                  }}
                  className="px-6 py-3 border border-gray-300 text-foreground rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={submittingRequest}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRequest}
                  disabled={submittingRequest}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingRequest ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
