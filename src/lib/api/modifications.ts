'use client';

import { apiFetchJson, getGatewayBase } from './client';

function base(): string | undefined {
  // Route through Next.js proxy by default
  if (process.env.NEXT_PUBLIC_USE_DEV_PROXY !== '0') {
    return '/api/proxy/modifications';
  }
  const gw = getGatewayBase();
  if (gw) return `${gw.replace(/\/$/, '')}/api/modifications`;
  // Direct to modification service (port 8092)
  const direct = (process.env.NEXT_PUBLIC_API_BASE_MODIFICATION as string | undefined)?.trim() || 'http://localhost:8092';
  return `${direct.replace(/\/$/, '')}/api/modifications`;
}

export type ModificationPayload = {
  userId?: string;
  vehicleId: string;
  vehicleLabel?: string;
  subject: string;
  message: string;
};

export type ModificationDTO = {
  id: string;
  userId: string;
  vehicleId: string;
  vehicleLabel?: string;
  subject: string;
  message: string;
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  createdAt: string;
  updatedAt: string;
};

export async function listModificationsByUser(uid: string): Promise<ModificationDTO[]> {
  const b = base();
  if (!b) throw new Error('API base URL not configured');
  const url = `${b}/user/${encodeURIComponent(uid)}`;
  return apiFetchJson<ModificationDTO[]>(url);
}

export async function createModification(payload: ModificationPayload): Promise<ModificationDTO> {
  const b = base();
  if (!b) throw new Error('API base URL not configured');
  const url = b;
  return apiFetchJson<ModificationDTO>(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getModificationById(id: string): Promise<ModificationDTO> {
  const b = base();
  if (!b) throw new Error('API base URL not configured');
  const url = `${b}/${encodeURIComponent(id)}`;
  return apiFetchJson<ModificationDTO>(url);
}

export async function updateModificationStatus(id: string, status: string): Promise<ModificationDTO> {
  const b = base();
  if (!b) throw new Error('API base URL not configured');
  const url = `${b}/${encodeURIComponent(id)}/status?status=${encodeURIComponent(status)}`;
  return apiFetchJson<ModificationDTO>(url, {
    method: 'PATCH',
  });
}

export async function deleteModificationById(id: string): Promise<void> {
  const b = base();
  if (!b) throw new Error('API base URL not configured');
  const url = `${b}/${encodeURIComponent(id)}`;
  await apiFetchJson(url, { method: 'DELETE' });
}

