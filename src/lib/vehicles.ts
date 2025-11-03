// src/lib/vehicles.ts
'use client';

import { db, storage } from '@/lib/firebase';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

export interface VehicleInput {
  make: string;
  model: string;
  year: string;
  numberPlate: string;
}

export interface VehicleDoc extends VehicleInput {
  id: string;
  photoURL?: string;
  createdAt?: any;
}

export async function addVehicle(uid: string, data: VehicleInput, imageFile?: File): Promise<VehicleDoc> {
  // Create the vehicle doc first to get an ID
  const colRef = collection(db, 'users', uid, 'vehicles');
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp(),
  });

  let photoURL: string | undefined = undefined;
  if (imageFile) {
    const ext = (imageFile.name.split('.').pop() || 'jpg').toLowerCase();
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
    const objectRef = ref(storage, `users/${uid}/vehicles/${docRef.id}.${safeExt}`);
    await uploadBytes(objectRef, imageFile, { contentType: imageFile.type || `image/${safeExt}` });
    photoURL = await getDownloadURL(objectRef);
    await updateDoc(doc(db, 'users', uid, 'vehicles', docRef.id), { photoURL });
  }

  return { id: docRef.id, ...data, photoURL };
}

export function subscribeVehicles(uid: string, cb: (vehicles: VehicleDoc[]) => void) {
  const q = query(collection(db, 'users', uid, 'vehicles'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const items: VehicleDoc[] = [];
    snap.forEach((d) => {
      const v = d.data() as any;
      items.push({ id: d.id, make: v.make, model: v.model, year: v.year, numberPlate: v.numberPlate, photoURL: v.photoURL, createdAt: v.createdAt });
    });
    cb(items);
  });
}

export async function deleteVehicle(uid: string, vehicleId: string) {
  await deleteDoc(doc(db, 'users', uid, 'vehicles', vehicleId));
}
