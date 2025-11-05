"use client";
import React, { useState } from "react";
import { LucideArrowLeft, LucideInfo, LucideImagePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { addVehicle } from "@/lib/vehicles";

export default function VehicleRegistration() {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [numberPlate, setNumberPlate] = useState("");
  const [success, setSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const isImage = f.type.startsWith("image/");
    const maxBytes = 5 * 1024 * 1024;
    if (!isImage) return alert("Please select an image file.");
    if (f.size > maxBytes) return alert("Image too large. Max 5MB.");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return router.push('/');
    try {
      setSaving(true);
      await addVehicle(user.uid, { make, model, year, numberPlate }, file || undefined);
      setSuccess(true);
      // Optionally redirect back to My Vehicles after a delay
      setTimeout(() => router.push('/customer/vehicles'), 800);
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Failed to register vehicle');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
          <div className="flex h-full grow flex-col">
            <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-5">
              <div className="flex flex-col max-w-[960px] flex-1 bg-white rounded-lg shadow-sm p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                <div className="flex items-center gap-4 p-4">
                  <a className="flex items-center gap-2 text-[#886364] hover:text-primary transition-colors" href="/customer/vehicles">
                    <LucideArrowLeft />
                    <span className="font-medium">My Vehicles</span>
                  </a>
                </div>
                <div className="flex flex-wrap justify-between gap-3 p-4">
                  <div className="flex min-w-72 flex-col gap-3">
                    <p className="text-[#181111] text-4xl font-black leading-tight tracking-[-0.033em]">Add a New Vehicle</p>
                    <p className="text-[#886364] text-base font-normal leading-normal">Enter your vehicle's information to add it to your profile.</p>
                  </div>
                </div>
                <h2 className="text-[#181111] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Vehicle Information</h2>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-3">
                    <label className="flex flex-col">
                      <p className="text-[#181111] text-base font-medium leading-normal pb-2">Make</p>
                      <input className="form-input rounded-lg h-14 p-[15px] text-base font-normal leading-normal border border-[#e5dcdc] bg-white text-[#181111]" placeholder="e.g. Toyota" value={make} onChange={e => setMake(e.target.value)} required />
                    </label>
                    <label className="flex flex-col">
                      <p className="text-[#181111] text-base font-medium leading-normal pb-2">Model</p>
                      <input className="form-input rounded-lg h-14 p-[15px] text-base font-normal leading-normal border border-[#e5dcdc] bg-white text-[#181111]" placeholder="e.g. Camry" value={model} onChange={e => setModel(e.target.value)} required />
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-3">
                    <label className="flex flex-col">
                      <p className="text-[#181111] text-base font-medium leading-normal pb-2">Year</p>
                      <input className="form-input rounded-lg h-14 p-[15px] text-base font-normal leading-normal border border-[#e5dcdc] bg-white text-[#181111]" placeholder="e.g. 2023" value={year} onChange={e => setYear(e.target.value)} required />
                    </label>
                    <div className="flex flex-col">
                      <div className="flex items-center pb-2">
                        <p className="text-[#181111] text-base font-medium leading-normal">Number Plate</p>
                        <span className="ml-2 cursor-pointer text-[#886364] text-lg"><LucideInfo /></span>
                      </div>
                      <input className="form-input rounded-lg h-14 p-[15px] text-base font-normal leading-normal border border-[#e5dcdc] bg-white text-[#181111]" placeholder="Enter vehicle number plate" value={numberPlate} onChange={e => setNumberPlate(e.target.value)} required />
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <label className="flex items-center gap-3 cursor-pointer text-primary font-medium">
                      <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                      <LucideImagePlus />
                      <span>Upload vehicle photo (optional, max 5MB)</span>
                    </label>
                    {preview && (
                      <div className="mt-3 w-full max-w-sm h-40 rounded-lg bg-center bg-cover bg-no-repeat border" style={{ backgroundImage: `url('${preview}')` }} />
                    )}
                  </div>
                  <div className="flex px-4 py-8 justify-start">
                    <button type="submit" disabled={saving} className="rounded-lg h-12 px-5 flex-1 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors disabled:opacity-80 disabled:cursor-not-allowed">
                      <span className="truncate">{saving ? 'Saving…' : 'Add Vehicle'}</span>
                    </button>
                  </div>
                  {success && (
                    <div className="mx-4 my-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                      <p>Your {year} {make} {model} has been successfully added to your profile.</p>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
    </>
  );
}
