"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "firebase/auth";
import { uploadProfileImage, saveUserProfile } from "@/lib/user";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

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

  React.useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/");
        return;
      }
      setDisplayName(user.displayName || "");
      setPreview(user.photoURL || null);
    }
  }, [user, loading, router]);

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
      if (file) {
        photoURL = await uploadProfileImage(user.uid, file);
      }

      // Always use the freshest auth user when updating profile
      const current = auth.currentUser;
      if (!current) throw new Error("You're not signed in. Please re-login.");

      // Update Firebase Auth profile (name, photo)
      await updateProfile(current, {
        displayName: displayName || null,
        photoURL: photoURL || null,
      });

      // Save extended profile data in Firestore
      await saveUserProfile(user.uid, {
        displayName: displayName || undefined,
        phone: phone || undefined,
        photoURL: photoURL || undefined,
      });

      // Refresh AuthContext so UI updates
      await refreshUser();
      setMessage("Profile updated successfully.");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">Loading…</div>
    );
  }

  if (!user) return null;

  return (
    <>
          <div className="p-8 max-w-3xl">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-[#181111]">Settings</h1>
              <p className="text-gray-500 mt-1">Update your profile information and photo.</p>
            </div>

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
                {message && <span className="text-green-600 text-sm">{message}</span>}
                {error && <span className="text-red-600 text-sm">{error}</span>}
              </div>
            </form>
          </div>
    </>
  );
}
