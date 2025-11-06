// src/lib/vehicles.ts
'use client';

import { db, storage } from '@/lib/firebase';
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { uploadViaLocalApi } from '@/lib/localUpload';
import { getGatewayBase } from '@/lib/api/client';
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

export async function addVehicle(uid: string, data: VehicleInput, imageFile?: File): Promise<VehicleDoc & { backgroundUpload?: boolean }> {
  const gw = getGatewayBase();
  // Backend-first: call API if gateway is configured
  if (gw) {
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

  const colRef = collection(db, 'users', uid, 'vehicles');
  // No image: create doc immediately
  if (!imageFile) {
    const docRef = await addDoc(colRef, { ...data, createdAt: serverTimestamp() });
    return { id: docRef.id, ...data };
  }

  const useLocal = process.env.NEXT_PUBLIC_LOCAL_UPLOAD === '1';
  if (useLocal) {
    // Dev-only: save image under public/local_uploads and write doc with URL
    const ext = (imageFile.name.split('.').pop() || 'jpg').toLowerCase();
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
    const filename = `${Date.now().toString()}.${safeExt}`;
    const url = await uploadViaLocalApi(imageFile, `users/${uid}/vehicles`, filename);
    /* Firebase Storage upload path (disabled in local mode)
    const objectRef = ref(storage, `users/${uid}/vehicles/${Date.now().toString()}.${safeExt}`);
    const task = uploadBytesResumable(objectRef, imageFile, { contentType: imageFile.type || `image/${safeExt}` });
    */
    const docRef = await addDoc(colRef, { ...data, photoURL: url, createdAt: serverTimestamp() });
    return { id: docRef.id, ...data, photoURL: url };
  }

  // With image: try blocking upload, but fall back after a timeout and finish upload in background
  const ext = (imageFile.name.split('.').pop() || 'jpg').toLowerCase();
  const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
  const objectRef = ref(storage, `users/${uid}/vehicles/${Date.now().toString()}.${safeExt}`);
  const task = uploadBytesResumable(objectRef, imageFile, { contentType: imageFile.type || `image/${safeExt}` });

  const timeoutMs = 15000; // 15s hard cap to avoid UI being stuck forever
  const uploadPromise = new Promise<string>((resolve, reject) => {
    task.on(
      'state_changed',
      undefined,
      (err) => reject(err),
      async () => {
        try {
          const url = await getDownloadURL(objectRef);
          resolve(url);
        } catch (e) {
          reject(e);
        }
      }
    );
  });

  let photoURL: string | undefined;
  let _timedOut = false;
  try {
    photoURL = await Promise.race<string>([
      uploadPromise,
      new Promise<string>((_, rej) => setTimeout(() => { _timedOut = true; rej(new Error('upload-timeout')); }, timeoutMs)),
    ]);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    if (message !== 'upload-timeout') {
      console.error('Vehicle image upload failed', e);
    }
  }

  // If upload completed in time, write doc with photoURL
  if (photoURL) {
    const docRef = await addDoc(colRef, { ...data, photoURL, createdAt: serverTimestamp() });
    return { id: docRef.id, ...data, photoURL };
  }

  // Fallback: create doc immediately without photo, keep upload running and patch later
  const docRef = await addDoc(colRef, { ...data, createdAt: serverTimestamp() });
  // Continue in background: once upload finishes, patch the doc with photoURL
  uploadPromise
    .then(async (url) => {
      try {
        await updateDoc(doc(db, 'users', uid, 'vehicles', docRef.id), { photoURL: url });
      } catch (err) {
        console.warn('Failed to patch vehicle photoURL in background', err);
      }
    })
    .catch(() => {/* swallow; user already has the doc without photo */});
  return { id: docRef.id, ...data, backgroundUpload: true };
}

export function subscribeVehicles(uid: string, cb: (vehicles: VehicleDoc[]) => void) {
  // If backend gateway is configured, poll the backend list endpoint instead of Firestore realtime
  const gw = getGatewayBase();
  if (gw) {
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
    const tick = async () => {
      try {
        const list = await listVehiclesByUser(uid);
        if (!cancelled) cb(list.map(toDoc));
      } catch (e) {
        console.warn('vehicles backend polling error', e);
      } finally {
        if (!cancelled) timer = setTimeout(tick, 8000);
      }
    };
    tick();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }

  // Fallback: Firestore realtime subscription
  const q = query(collection(db, 'users', uid, 'vehicles'));
  return onSnapshot(
    q,
    (snap) => {
      const items: VehicleDoc[] = [];
      snap.forEach((d) => {
        const v = d.data() as Record<string, unknown>;
        items.push({ id: d.id, make: v.make as string, model: v.model as string, year: v.year as string, numberPlate: v.numberPlate as string, photoURL: v.photoURL as string | undefined, createdAt: v.createdAt });
      });
      // Sort client-side by createdAt desc if available
      items.sort((a, b) => {
        const aTs = (a.createdAt && (a.createdAt as any).seconds) ? (a as any).createdAt.seconds : 0;
        const bTs = (b.createdAt && (b.createdAt as any).seconds) ? (b as any).createdAt.seconds : 0;
        return bTs - aTs;
      });
      cb(items);
    },
    (error) => {
      console.warn('vehicles subscription error', error);
      // Do not clear UI here; consumers can decide how to handle errors.
    }
  );
}

export async function fetchVehicles(uid: string): Promise<VehicleDoc[]> {
  const gw = getGatewayBase();
  if (gw) {
    const list = await listVehiclesByUser(uid);
    return list.map((d) => ({
      id: d.id,
      make: d.make,
      model: d.model,
      year: String(d.year as any),
      numberPlate: d.numberPlate,
      photoURL: d.photoURL,
      createdAt: d.createdAt as any,
    }));
  }
  const snap = await getDocs(collection(db, 'users', uid, 'vehicles'));
  const items: VehicleDoc[] = [];
  snap.forEach((d) => {
    const v = d.data() as Record<string, unknown>;
    items.push({ id: d.id, make: v.make as string, model: v.model as string, year: v.year as string, numberPlate: v.numberPlate as string, photoURL: v.photoURL as string | undefined, createdAt: v.createdAt });
  });
  items.sort((a, b) => {
    const aTs = (a.createdAt && (a.createdAt as any).seconds) ? (a as any).createdAt.seconds : 0;
    const bTs = (b.createdAt && (b.createdAt as any).seconds) ? (b as any).createdAt.seconds : 0;
    return bTs - aTs;
  });
  return items;
}

export async function deleteVehicle(uid: string, vehicleId: string) {
  const gw = getGatewayBase();
  if (gw) {
    await apiDeleteVehicleById(vehicleId);
    return;
  }
  await deleteDoc(doc(db, 'users', uid, 'vehicles', vehicleId));
}

export async function updateVehicle(
  uid: string,
  vehicleId: string,
  data: Partial<VehicleInput>,
  imageFile?: File
) {
  const gw = getGatewayBase();
  const updateData: Record<string, unknown> = { ...data };

  // Upload new image if provided
  if (imageFile) {
    const useLocal = process.env.NEXT_PUBLIC_LOCAL_UPLOAD === '1';
    if (useLocal) {
      const ext = (imageFile.name.split('.').pop() || 'jpg').toLowerCase();
      const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
      const filename = `${vehicleId}.${safeExt}`;
      const url = await uploadViaLocalApi(imageFile, `users/${uid}/vehicles`, filename);
      /* Firebase Storage upload path (disabled in local mode)
      const objectRef = ref(storage, `users/${uid}/vehicles/${vehicleId}.${safeExt}`);
      await uploadBytes(objectRef, imageFile, { contentType: imageFile.type || `image/${safeExt}` });
      const firebaseUrl = await getDownloadURL(objectRef);
      updateData.photoURL = firebaseUrl;
      */
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

  // Backend-first: update via API when configured
  if (gw) {
    const payload: any = { ...updateData };
    if (payload.year !== undefined) {
      payload.year = Number.isNaN(Number(payload.year)) ? payload.year : Number(payload.year);
    }
    await apiUpdateVehicleById(vehicleId, payload);
    return;
  }

  // Update vehicle doc with all changes at once
  const refDoc = doc(db, 'users', uid, 'vehicles', vehicleId);
  await updateDoc(refDoc, updateData);
}
