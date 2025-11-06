// src/lib/user.ts
'use client';

import { auth, db, storage } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { uploadViaLocalApi } from '@/lib/localUpload';
import { createCustomer, updateCustomer } from '@/lib/api/customers';
import { updateProfile } from 'firebase/auth';

export interface UserProfileInput {
  displayName?: string;
  phone?: string;
  photoURL?: string;
  idNumber?: string;
  address?: string;
  birthday?: string; // ISO date (YYYY-MM-DD)
}

export async function saveUserProfile(uid: string, data: UserProfileInput) {
  // Attempt backend update via REST (works with gateway or dev proxy). Fall back to Firestore if not configured.
  const payload: any = { ...data };
  try {
    await updateCustomer(uid, payload);
  } catch (e: any) {
    if (e?.status === 404) {
      const email = auth.currentUser?.email || `${uid}@example.local`;
      try {
        await createCustomer({ firebaseUid: uid, email, ...payload });
      } catch (inner) {
        console.warn('Create customer via backend failed; will still write to Firestore', inner);
      }
    } else if (e?.message === 'API base URL not configured') {
      // No backend configured; proceed with Firestore only.
    } else {
      console.warn('Backend profile update failed; falling back to Firestore', e);
    }
  }

  // Also update Firebase Auth profile for immediate UI consistency
  try {
    if (auth.currentUser && (data.displayName || data.photoURL)) {
      await updateProfile(auth.currentUser, {
        displayName: data.displayName ?? auth.currentUser.displayName ?? undefined,
        photoURL: data.photoURL ?? auth.currentUser.photoURL ?? undefined,
      });
    }
  } catch (e) {
    console.warn('Failed to update Firebase Auth profile (non-fatal)', e);
  }

  const userRef = doc(db, 'users', uid);
  // Filter out undefined values before saving
  const cleanData: Record<string, any> = {
    updatedAt: serverTimestamp(),
  };
  
  if (data.displayName !== undefined) cleanData.displayName = data.displayName;
  if (data.phone !== undefined) cleanData.phone = data.phone;
  if (data.photoURL !== undefined) cleanData.photoURL = data.photoURL;
  if (data.idNumber !== undefined) cleanData.idNumber = data.idNumber;
  if (data.address !== undefined) cleanData.address = data.address;
  if (data.birthday !== undefined) cleanData.birthday = data.birthday;
  
  await setDoc(userRef, cleanData, { merge: true });
}

export async function uploadProfileImage(uid: string, file: File): Promise<string> {
  try {
    const useLocal = process.env.NEXT_PUBLIC_LOCAL_UPLOAD === '1';
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
    if (useLocal) {
      // Dev-only local upload. Firebase Storage code kept for easy revert.
      const url = await uploadViaLocalApi(file, `users/${uid}`, `profile.${safeExt}`);
      /* Firebase Storage upload (disabled in local mode)
      const objectRef = ref(storage, `users/${uid}/profile.${safeExt}`);
      await uploadBytes(objectRef, file, { contentType: file.type || `image/${safeExt}` });
      const firebaseUrl = await getDownloadURL(objectRef);
      return firebaseUrl;
      */
      return url;
    } else {
      const objectRef = ref(storage, `users/${uid}/profile.${safeExt}`);
      await uploadBytes(objectRef, file, { contentType: file.type || `image/${safeExt}` });
      return await getDownloadURL(objectRef);
    }
  } catch (err: any) {
    // Surface helpful guidance when Storage rules/CORS might be the root cause
    const hint = 'If this is a web (localhost) upload, ensure Firebase Storage rules allow authenticated writes to users/{uid}/** and the bucket CORS config allows origin http://localhost:3000.';
    throw new Error((err?.message || 'Upload failed') + ` — ${hint}`);
  }
}
