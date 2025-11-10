// src/lib/vehicles.ts
'use client';

import { storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { uploadViaLocalApi } from '@/lib/localUpload';
import { listVehiclesByUser, type VehicleDTO, createVehicle as apiCreateVehicle, updateVehicleById as apiUpdateVehicleById, deleteVehicleById as apiDeleteVehicleById } from '@/lib/api/vehicles';

export interface VehicleInput {
  make: string;
  model: string;
  year: string;
  numberPlate: string;
}

export interface VehicleDoc extends VehicleInput {
  id: string;
  photoURL?: string;
  createdAt?: unknown;
}

// --- Lightweight client-side cache to make vehicle lists display instantly ---
function readCachedVehicles(uid: string): VehicleDoc[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(`vehicles:${uid}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as VehicleDoc[];
  } catch {}
  return null;
}
function writeCachedVehicles(uid: string, list: VehicleDoc[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`vehicles:${uid}`, JSON.stringify(list));
  } catch {}
}

export async function addVehicle(uid: string, data: VehicleInput, imageFile?: File): Promise<VehicleDoc & { backgroundUpload?: boolean }> {
  // Always use backend Vehicle Service as source of truth. Upload image (local or storage) and pass URL to backend.
  let photoURL: string | undefined;
  if (imageFile) {
    const useLocal = process.env.NEXT_PUBLIC_LOCAL_UPLOAD === '1';
    const ext = (imageFile.name.split('.').pop() || 'jpg').toLowerCase();
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
    if (useLocal) {
      photoURL = await uploadViaLocalApi(imageFile, `users/${uid}/vehicles`, `${Date.now().toString()}.${safeExt}`);
    } else {
      const objectRef = ref(storage, `users/${uid}/vehicles/${Date.now().toString()}.${safeExt}`);
      await uploadBytes(objectRef, imageFile, { contentType: imageFile.type || `image/${safeExt}` });
      photoURL = await getDownloadURL(objectRef);
    }
  }
  const yearNum = Number.isNaN(Number(data.year)) ? data.year : Number(data.year);
  const created = await apiCreateVehicle({ make: data.make, model: data.model, year: yearNum as any, numberPlate: data.numberPlate, photoURL });
  return { id: created.id, make: created.make, model: created.model, year: String(created.year as any), numberPlate: created.numberPlate, photoURL: created.photoURL };
}

export function subscribeVehicles(uid: string, cb: (vehicles: VehicleDoc[]) => void) {
  // Always prefer backend list endpoint; emit cached list immediately, then poll.
  let cancelled = false;
  let timer: any;
  const toDoc = (d: VehicleDTO): VehicleDoc => ({
    id: d.id,
    make: d.make,
    model: d.model,
    year: String(d.year as any),
    numberPlate: d.numberPlate,
    photoURL: d.photoURL,
    createdAt: d.createdAt as any,
  });
  const cached = readCachedVehicles(uid);
  if (cached && cached.length) {
    try { cb(cached); } catch {}
  }
  const tick = async () => {
    try {
      const list = await listVehiclesByUser(uid);
      if (!cancelled) {
        const docs = list.map(toDoc);
        writeCachedVehicles(uid, docs);
        cb(docs);
      }
    } catch (e) {
      console.warn('vehicles backend polling error', e);
    } finally {
      if (!cancelled) timer = setTimeout(tick, 8000);
    }
  };
  tick();
  return () => { cancelled = true; if (timer) clearTimeout(timer); };
}

export async function fetchVehicles(uid: string): Promise<VehicleDoc[]> {
  // Prefer cached list for instant return; live updates arrive via subscribeVehicles polling
  const cached = readCachedVehicles(uid);
  if (cached) return cached;
  const list = await listVehiclesByUser(uid);
  const docs = list.map((d) => ({
    id: d.id,
    make: d.make,
    model: d.model,
    year: String(d.year as any),
    numberPlate: d.numberPlate,
    photoURL: d.photoURL,
    createdAt: d.createdAt as any,
  }));
  writeCachedVehicles(uid, docs);
  return docs;
}

export async function deleteVehicle(uid: string, vehicleId: string) {
  await apiDeleteVehicleById(vehicleId);
}

export async function updateVehicle(
  uid: string,
  vehicleId: string,
  data: Partial<VehicleInput>,
  imageFile?: File
) {
  const updateData: Record<string, unknown> = { ...data };

  // Upload new image if provided
  if (imageFile) {
    const useLocal = process.env.NEXT_PUBLIC_LOCAL_UPLOAD === '1';
    if (useLocal) {
      const ext = (imageFile.name.split('.').pop() || 'jpg').toLowerCase();
      const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
      const filename = `${vehicleId}.${safeExt}`;
      const url = await uploadViaLocalApi(imageFile, `users/${uid}/vehicles`, filename);
      updateData.photoURL = url;
    } else {
      try {
        const ext = (imageFile.name.split('.').pop() || 'jpg').toLowerCase();
        const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
        const objectRef = ref(storage, `users/${uid}/vehicles/${vehicleId}.${safeExt}`);
        await uploadBytes(objectRef, imageFile, { contentType: imageFile.type || `image/${safeExt}` });
        updateData.photoURL = await getDownloadURL(objectRef);
      } catch (e) {
        console.error('Vehicle image update failed', e);
        throw new Error('Failed to upload vehicle image. Please try again.');
      }
    }
  }

  // Always update via backend service; convert year if numeric-like
  const payload: any = { ...updateData };
  if (payload.year !== undefined) {
    payload.year = Number.isNaN(Number(payload.year)) ? payload.year : Number(payload.year);
  }
  await apiUpdateVehicleById(vehicleId, payload);
}
