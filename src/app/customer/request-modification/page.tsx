"use client";

// ...existing imports...
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { subscribeVehicles, type VehicleDoc } from "@/lib/vehicles";
import {
  createModification,
  listModificationsByUser,
  deleteModificationById,
  type ModificationDTO,
} from "@/lib/api/modifications";
import { Loader2, CheckCircle, LucideClock, LucideCheck, LucideX, LucideWrench, LucideTrash2 } from "lucide-react";

export default function VisualModification() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [vehicles, setVehicles] = useState<VehicleDoc[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [inquiry, setInquiry] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [myModifications, setMyModifications] = useState<ModificationDTO[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeVehicles(user.uid, (data) => setVehicles(data));
    return () => unsub && unsub();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setHistoryLoading(false);
      return;
    }
    const fetchModifications = async () => {
      try {
        const list = await listModificationsByUser(user.uid);
        setMyModifications(list);
      } catch {
        setMyModifications([]);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchModifications();
    const interval = setInterval(fetchModifications, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSubmit = async () => {
    if (!selectedVehicleId || !subject.trim() || !inquiry.trim()) {
      setSubmitErr("Please fill all fields.");
      return;
    }
    setSubmitting(true);
    setSubmitErr(null);
    try {
      await createModification({
        vehicleId: selectedVehicleId,
        subject,
        message: inquiry,
      });
      setSubmitMsg("Modification request submitted successfully!");
      setSubject("");
      setInquiry("");
      setTimeout(() => setSubmitMsg(null), 4000);
    } catch (e: any) {
      setSubmitErr(e?.message || "Failed to submit request.");
      setTimeout(() => setSubmitErr(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (modId: string) => {
    setDeletingId(modId);
    setDeleteConfirmId(null);
    try {
      await deleteModificationById(modId);
      const list = await listModificationsByUser(user!.uid);
      setMyModifications(list);
      setSubmitMsg("✓ Modification request deleted successfully");
      setTimeout(() => setSubmitMsg(null), 3000);
    } catch (error: any) {
      setSubmitErr(error?.message || "Failed to delete request. Please try again.");
      setTimeout(() => setSubmitErr(null), 5000);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: ModificationDTO["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
            <LucideClock size={14} />
            Pending
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
            <LucideCheck size={14} />
            Approved
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
            <LucideWrench size={14} />
            In Progress
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
            <LucideCheck size={14} />
            Completed
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
            <LucideX size={14} />
            Rejected
          </span>
        );
      default:
        return <span className="text-gray-500 text-xs">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pt-12 pb-12">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2">Visual Modifications</h1>
          <p className="text-lg text-muted-foreground mb-6">Customize your vehicle with our expert visual modification services.</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Request a Visual Modification</h2>
          <p className="text-muted-foreground mb-6">Choose one of your registered vehicles and describe the visual modification you want (e.g., stickering, bulb change).</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
              <label className="block font-medium mb-2">Vehicle</label>
              <select
                className="w-full border rounded-lg px-3 py-2 mb-4"
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
              >
                <option value="">Select vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.year} {v.make} {v.model} — {v.numberPlate}</option>
                ))}
              </select>
              {selectedVehicleId && (() => {
                const vehicle = vehicles.find(v => v.id === selectedVehicleId);
                if (!vehicle) return null;
                return (
                  <div className="flex flex-col items-center gap-2 mt-2">
                    <img
                      src={vehicle.photoURL || "/public/logos/default-vehicle.png"}
                      alt={vehicle.make + " " + vehicle.model}
                      className="h-32 w-48 object-cover rounded-lg border mb-2"
                    />
                    <div className="font-semibold text-base">{vehicle.numberPlate}</div>
                    <div className="text-sm text-muted-foreground">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                  </div>
                );
              })()}
            </div>
            <div>
              <label className="block font-medium mb-2">Topic</label>
              <input
                className="w-full border rounded-lg px-3 py-2 mb-4"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Crash guard, Stickering, etc."
              />
              <label className="block font-medium mb-2">Your message</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 mb-4"
                value={inquiry}
                onChange={(e) => setInquiry(e.target.value)}
                placeholder="Describe the modification you want..."
              />
              <button
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold mt-2"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
              {submitMsg && <div className="mt-4 text-green-600">{submitMsg}</div>}
              {submitErr && <div className="mt-4 text-red-600">{submitErr}</div>}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-4">My Modification History</h2>
          {historyLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          ) : myModifications.length === 0 ? (
            <p className="text-muted-foreground">No modification requests yet.</p>
          ) : (
            <ul className="space-y-4">
              {myModifications.map((mod) => (
                <li key={mod.id} className="border rounded-lg p-4 flex flex-col gap-2 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{mod.subject}</span>
                    {getStatusBadge(mod.status)}
                  </div>
                  <div className="text-sm text-muted-foreground">Vehicle: {(() => {
                    const v = vehicles.find(vv => vv.id === mod.vehicleId);
                    return v ? `${v.year} ${v.make} ${v.model} — ${v.numberPlate}` : mod.vehicleId;
                  })()}</div>
                  <div className="text-sm">{mod.message}</div>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs"
                      onClick={() => setDeleteConfirmId(mod.id)}
                      disabled={deletingId === mod.id}
                    >
                      Delete
                    </button>
                    {deleteConfirmId === mod.id && (
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs"
                        onClick={() => handleDelete(mod.id)}
                        disabled={deletingId === mod.id}
                      >
                        Confirm Delete
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
