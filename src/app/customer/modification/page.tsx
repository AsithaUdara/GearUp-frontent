"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { subscribeVehicles, type VehicleDoc } from '@/lib/vehicles';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// (Removed complex mock service content)

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
      <div className="pt-10 pb-16">
        <div className="container mx-auto px-6">
          {/* Simple Vehicle Modification Inquiry */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8 mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-2">Request a Vehicle Modification</h1>
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
            <div className="flex items-center gap-3 mt-4">
              <button
                disabled={submitting || !selectedVehicleId || !subject.trim() || !inquiry.trim()}
                onClick={async () => {
                  if (!user || !selectedVehicleId || !subject.trim() || !inquiry.trim()) return;
                  setSubmitting(true);
                  setSubmitMsg(null);
                  setSubmitErr(null);
                  try {
                    const vehicle = vehicles.find(v => v.id === selectedVehicleId);
                    await addDoc(collection(db, 'modifications'), {
                      userId: user.uid,
                      vehicleId: selectedVehicleId,
                      vehicleLabel: vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model} — ${vehicle.numberPlate}` : null,
                      subject: subject.trim(),
                      message: inquiry.trim(),
                      status: 'pending',
                      createdAt: serverTimestamp(),
                    });
                    setSubmitMsg('Your modification request has been submitted. We will contact you soon.');
                    setSelectedVehicleId('');
                    setSubject('');
                    setInquiry('');
                  } catch (e: any) {
                    console.error(e);
                    setSubmitErr(e?.message || 'Failed to submit request. Please try again.');
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className={`px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors ${submitting ? 'opacity-80 cursor-not-allowed' : ''}`}
              >
                {submitting ? 'Submitting…' : 'Submit Request'}
              </button>
              {submitMsg && (
                <div className="px-3 py-2 rounded-lg bg-green-100 text-green-700 text-sm border border-green-300">{submitMsg}</div>
              )}
              {submitErr && (
                <div className="px-3 py-2 rounded-lg bg-red-100 text-red-700 text-sm border border-red-300">{submitErr}</div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

