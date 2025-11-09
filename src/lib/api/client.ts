'use client';

import { auth } from '@/lib/firebase';

// IMPORTANT: Next.js only inlines env vars referenced statically.
// Do NOT use dynamic keys to read NEXT_PUBLIC_* values.
export function getGatewayBase(): string | undefined {
  // Prefer explicit gateway var; fall back to legacy API base.
  return (
    (process.env.NEXT_PUBLIC_GATEWAY_BASE as string | undefined)?.trim() ||
    (process.env.NEXT_PUBLIC_API_BASE as string | undefined)?.trim() ||
    undefined
  );
}

export function getVehicleBase(): string | undefined {
  return (process.env.NEXT_PUBLIC_API_BASE_VEHICLE as string | undefined)?.trim() || undefined;
}

export function getCustomerBase(): string | undefined {
  return (process.env.NEXT_PUBLIC_API_BASE_CUSTOMER as string | undefined)?.trim() || undefined;
}

async function getIdToken(): Promise<string | undefined> {
  try {
    const u = auth.currentUser;
    if (!u) return undefined;
    return await u.getIdToken();
  } catch {
    return undefined;
  }
}

export async function apiFetchJson<T = any>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type') && init.method && init.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }

  // Get Firebase user and send both Authorization Bearer + X-User-ID
  const u = auth.currentUser;
  if (u) {
    // Send Firebase ID token
    const token = await getIdToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    // Send user ID (backend validation requires this)
    if (!headers.has('X-User-ID')) {
      headers.set('X-User-ID', u.uid);
    }
  }

  const resp = await fetch(url, { ...init, headers });
  const text = await resp.text();
  const isJson = (resp.headers.get('content-type') || '').includes('application/json');
  const data = isJson && text ? JSON.parse(text) : (text as unknown as T);
  if (!resp.ok) {
    const err = new Error((data && (data as any).message) || resp.statusText);
    (err as any).status = resp.status;
    (err as any).body = data;
    throw err;
  }
  return data as T;
}
