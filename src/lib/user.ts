// src/lib/user.ts
'use client';

import { db, storage } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

export interface UserProfileInput {
  displayName?: string;
  phone?: string;
  photoURL?: string;
}

export async function saveUserProfile(uid: string, data: UserProfileInput) {
  const userRef = doc(db, 'users', uid);
  // Filter out undefined values before saving
  const cleanData: Record<string, any> = {
    updatedAt: serverTimestamp(),
  };
  
  if (data.displayName !== undefined) cleanData.displayName = data.displayName;
  if (data.phone !== undefined) cleanData.phone = data.phone;
  if (data.photoURL !== undefined) cleanData.photoURL = data.photoURL;
  
  await setDoc(userRef, cleanData, { merge: true });
}

export async function uploadProfileImage(uid: string, file: File): Promise<string> {
  try {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
    const objectRef = ref(storage, `users/${uid}/profile.${safeExt}`);
    await uploadBytes(objectRef, file, { contentType: file.type || `image/${safeExt}` });
    return await getDownloadURL(objectRef);
  } catch (err: any) {
    // Surface helpful guidance when Storage rules/CORS might be the root cause
    const hint = 'If this is a web (localhost) upload, ensure Firebase Storage rules allow authenticated writes to users/{uid}/** and the bucket CORS config allows origin http://localhost:3000.';
    throw new Error((err?.message || 'Upload failed') + ` — ${hint}`);
  }
}
