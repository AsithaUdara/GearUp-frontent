"use client";
import React, { useMemo, useState } from "react";
import CustomerLayout from "@/app/components/customer/CustomerLayout";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "firebase/auth";
import { uploadProfileImage, saveUserProfile } from "@/lib/user";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  LucideCar,
  LucideCalendar,
  LucideHistory,
  LucideSettings,
  LucideBot,
  LucideLogOut,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

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

  const navItems = useMemo(
    () => [
      { icon: LucideCar, label: "Dashboard", href: "/customer/dashboard" },
      { icon: LucideCalendar, label: "Book Appointment", href: "/customer/book-appointment" },
      { icon: LucideHistory, label: "Service History", href: "/customer/service-history" },
      { icon: LucideCar, label: "My Vehicles", href: "/customer/vehicles" },
      { icon: LucideSettings, label: "Settings", href: "/customer/settings", active: true },
      { icon: LucideBot, label: "AI Chatbot", href: "/customer/chatbot" },
    ],
    []
  );

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
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
      <CustomerLayout>
        <div className="min-h-[60vh] flex items-center justify-center">Loading…</div>
      </CustomerLayout>
    );
  }

  if (!user) return null;

  return (
    <CustomerLayout>
      <div className="flex min-h-screen font-display">
        {/* Sidebar */}
  <aside className="w-72 rounded-2xl m-4 border border-glass-border bg-glass-bg/80 backdrop-blur-lg shadow-md flex-shrink-0 flex flex-col justify-between p-4 transition-all duration-300 hover:shadow-lg hover:bg-glass-bg/90 hover:ring-1 hover:ring-white/10">
          <div>
            <div className="flex items-center justify-center p-2 mb-6">
              <img 
                src="https://res.cloudinary.com/dgyqfax25/image/upload/v1730351497/gearup_logo_nwij8d.webp" 
                alt="GearUp Logo" 
                className="h-16 w-auto object-contain"
              />
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                style={{ backgroundImage: `url('${preview || 
                  "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(user.displayName || user.email || "User")}')` }}
              />
              <div className="flex flex-col">
                <h1 className="text-[#181111] text-base font-medium leading-normal">{user.displayName || "Your name"}</h1>
                <p className="text-gray-500 text-sm font-normal leading-normal">{user.email}</p>
              </div>
            </div>
            <nav className="flex flex-col gap-2 mb-6">
              {navItems.map((item) => {
                const IconComponent = item.icon as any;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200",
                      item.active
                        ? "bg-primary/20 text-primary backdrop-blur-sm"
                        : "hover:bg-white/20 hover:backdrop-blur-sm hover:shadow text-[#181111]"
                    )}
                  >
                    <IconComponent className={item.active ? "text-primary" : "text-[#181111]"} />
                    <p className={cn("text-sm font-medium leading-normal", item.active ? "text-primary" : "text-[#181111]")}>{item.label}</p>
                  </a>
                );
              })}
            </nav>
          </div>
          <div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/50 hover:backdrop-blur-sm hover:shadow-sm cursor-pointer w-full transition-all duration-200"
            >
              <LucideLogOut className="text-[#181111]" />
              <p className="text-[#181111] text-sm font-medium leading-normal">Log Out</p>
            </button>
          </div>
        </aside>

        {/* Main Content */}
  <main className="flex-1">
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
        </main>
      </div>
    </CustomerLayout>
  );
}
