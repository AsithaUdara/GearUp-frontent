"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "firebase/auth";
import { uploadProfileImage, saveUserProfile } from "@/lib/user";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function SettingsPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [idNumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");
  const [birthday, setBirthday] = useState("");

  React.useEffect(() => {
    // Layout handles auth redirect, we just populate the form when user is available
    if (!loading && user) {
      setDisplayName(user.displayName || "");
      setPreview(user.photoURL || null);
      // Prefill extended profile fields from Firestore
      (async () => {
        try {
          const ref = doc(db, 'users', user.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const d = snap.data() as any;
            if (d.phone) setPhone(d.phone);
            if (d.idNumber) setIdNumber(d.idNumber);
            if (d.address) setAddress(d.address);
            if (d.birthday) setBirthday(d.birthday);
          }
        } catch (e) {
          // non-blocking
          console.warn('Failed to load profile doc', e);
        }
      })();
    }
  }, [user, loading]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // Basic client-side validation: max 5MB and image MIME type
    const isImage = f.type.startsWith("image/");
    const maxBytes = 5 * 1024 * 1024;
    if (!isImage) {
      setError("Please select an image file (PNG, JPG, etc.)");
      return;
    }
    if (f.size > maxBytes) {
      setError("Image is too large. Max 5MB.");
      return;
    }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      let photoURL: string | null = user.photoURL || null;

      // Upload image first, but fall back after a timeout and finish in background
      if (file) {
        const timeoutMs = 15000;
        const uploadP = uploadProfileImage(user.uid, file);
        const race = Promise.race<string | 'timeout'>([
          uploadP,
          new Promise<'timeout'>(res => setTimeout(() => res('timeout'), timeoutMs)),
        ]);
        const result = await race;
        if (result !== 'timeout') {
          photoURL = result;
        } else {
          // proceed without photoURL for now; complete in background
          uploadP.then(async (url) => {
            try {
              const currentBg = auth.currentUser;
              if (currentBg) {
                await updateProfile(currentBg, { photoURL: url });
              }
              await saveUserProfile(user.uid, { photoURL: url });
              await refreshUser();
            } catch (e) {
              console.warn('Background profile photo update failed', e);
            }
          }).catch(() => {/* swallow */});
        }
      }

      // Always use the freshest auth user when updating profile
      const current = auth.currentUser;
      if (!current) throw new Error("You're not signed in. Please re-login.");

      // Update Firebase Auth profile (name and photo together)
      await updateProfile(current, {
        displayName: displayName || null,
        photoURL: photoURL || null,
      });

      // Save extended profile data in Firestore, but don't let UI hang forever
      const saveP = saveUserProfile(user.uid, {
        displayName: displayName || undefined,
        phone: phone || undefined,
        photoURL: photoURL || undefined,
        idNumber: idNumber || undefined,
        address: address || undefined,
        birthday: birthday || undefined,
      });
      const saveTimeoutMs = 12000;
      const saveOkP = saveP.then(() => 'ok' as const).catch(() => 'error' as const);
      const timeoutP = new Promise<'timeout'>((res) => setTimeout(() => res('timeout'), saveTimeoutMs));
      const saveRace = await Promise.race([saveOkP, timeoutP] as const);
      if (saveRace === "timeout") {
        // Finish in background; when it completes we refresh silently
        saveP.then(refreshUser).catch(() => {/* non-blocking */});
      } else if (saveRace === "error") {
        throw new Error("Failed to save profile details. Please check your connection or permissions.");
      }

  // Immediately refresh local preview if we have a new photo (or keep existing preview)
  if (photoURL) setPreview(photoURL);

  // Refresh AuthContext so UI updates (may have already scheduled via background)
  await refreshUser();
      setMessage("Profile updated successfully.");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Layout handles loading and auth check, so we can safely assume user exists here
  if (!user) return null;

  return (
    <>
      {/* Hero */}
      <div className="relative w-full overflow-hidden">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <img 
            src="https://res.cloudinary.com/dgyqfax25/image/upload/v1761888664/upscaled_1920x1080_j8cwcf.png"
            alt="Settings Hero"
            className="absolute inset-0 w-full h-full object-contain bg-black"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
            <div className="container mx-auto px-8">
              <div className="max-w-2xl">
                <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-4">
                  Settings
                </h1>
                <p className="text-white/90 text-lg md:text-xl font-normal leading-relaxed">
                  Update your profile information and preferences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
          <div className="p-8 max-w-3xl">
            {/* Title moved into hero */}

            <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-20 rounded-full bg-center bg-cover bg-no-repeat border"
                  style={{
                    backgroundImage: `url('${preview || 
                      "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(user.displayName || user.email || "User")}')`,
                  }}
                />
                <div>
                  <label className="inline-block cursor-pointer text-primary font-medium">
                    <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                    Change photo
                  </label>
                  <p className="text-xs text-gray-500">JPG, PNG under 5MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-[#181111] mb-1">Display name</label>
                  <input
                    className="h-12 rounded-lg border border-gray-200 px-3"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-[#181111] mb-1">Email</label>
                  <input className="h-12 rounded-lg border border-gray-200 px-3 bg-gray-50" value={user.email || ""} disabled />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-[#181111] mb-1">Phone</label>
                  <input
                    className="h-12 rounded-lg border border-gray-200 px-3"
                    placeholder="Optional"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-[#181111] mb-1">ID Number</label>
                  <input
                    className="h-12 rounded-lg border border-gray-200 px-3"
                    placeholder="e.g. NIC or license (letters and numbers)"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    pattern="[A-Za-z0-9\-\s]+"
                  />
                </div>
                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-[#181111] mb-1">Address</label>
                  <input
                    className="h-12 rounded-lg border border-gray-200 px-3"
                    placeholder="Street, City"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-[#181111] mb-1">Birthday</label>
                  <input
                    type="date"
                    className="h-12 rounded-lg border border-gray-200 px-3"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className={cn(
                    "rounded-lg h-12 px-6 bg-primary text-white font-semibold",
                    saving && "opacity-80 cursor-not-allowed"
                  )}
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
                {message && (
                  <div className="px-3 py-2 rounded-lg bg-green-100 text-green-700 text-sm border border-green-300">{message}</div>
                )}
                {error && (
                  <div className="px-3 py-2 rounded-lg bg-red-100 text-red-700 text-sm border border-red-300">{error}</div>
                )}
              </div>
            </form>
          </div>
    </>
  );
}
