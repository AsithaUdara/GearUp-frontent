// src/lib/vehicles.ts
'use client';

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
  // Upload image to LOCAL storage
  let photoURL: string | undefined;
  if (imageFile) {
    const ext = (imageFile.name.split('.').pop() || 'jpg').toLowerCase();
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
    photoURL = await uploadViaLocalApi(imageFile, `users/${uid}/vehicles`, `${Date.now().toString()}.${safeExt}`);
  }
  
  // Save to backend PostgreSQL (userId sent in request body + header)
  const yearNum = Number.isNaN(Number(data.year)) ? data.year : Number(data.year);
  const created = await apiCreateVehicle({ 
    make: data.make, 
    model: data.model, 
    year: yearNum as any, 
    numberPlate: data.numberPlate, 
    photoURL,
    userId: uid  // Include userId in body per backend fix
  });
  
  return { 
    id: created.id, 
    make: created.make, 
    model: created.model, 
    year: String(created.year as any), 
    numberPlate: created.numberPlate, 
    photoURL: created.photoURL 
  };
}

export function subscribeVehicles(uid: string, cb: (vehicles: VehicleDoc[]) => void) {
  // Poll backend every 8 seconds for updates
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
  // Fetch from backend PostgreSQL
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

  // Upload new image to LOCAL storage if provided
  if (imageFile) {
    const ext = (imageFile.name.split('.').pop() || 'jpg').toLowerCase();
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
    const filename = `${vehicleId}.${safeExt}`;
    const url = await uploadViaLocalApi(imageFile, `users/${uid}/vehicles`, filename);
    updateData.photoURL = url;
  }

  // Update backend PostgreSQL
  const payload: any = { ...updateData };
  if (payload.year !== undefined) {
    payload.year = Number.isNaN(Number(payload.year)) ? payload.year : Number(payload.year);
  }
  await apiUpdateVehicleById(vehicleId, payload);
}
