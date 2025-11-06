'use client';

import { apiFetchJson, getGatewayBase, getVehicleBase } from './client';

function base(): string | undefined {
  // Dev proxy to avoid CORS in direct mode
  if (process.env.NEXT_PUBLIC_USE_DEV_PROXY === '1') {
    return '/api/proxy/vehicles';
  }
  const gw = getGatewayBase();
  if (gw) return `${gw.replace(/\/$/, '')}/api/vehicles`;
  const vb = getVehicleBase();
  if (vb) return `${vb.replace(/\/$/, '')}/api/vehicles`;
  return undefined;
}

export type VehiclePayload = {
  make: string;
  model: string;
  year: number | string;
  numberPlate: string;
  photoURL?: string;
};

export type VehicleDTO = VehiclePayload & {
  id: string;
  userId: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function listVehiclesByUser(uid: string): Promise<VehicleDTO[]> {
  const b = base();
  if (!b) throw new Error('API base URL not configured');
  const url = `${b}/user/${encodeURIComponent(uid)}`;
  return apiFetchJson<VehicleDTO[]>(url);
}

export async function createVehicle(payload: VehiclePayload): Promise<VehicleDTO> {
  const b = base();
  if (!b) throw new Error('API base URL not configured');
  const url = b;
  return apiFetchJson<VehicleDTO>(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateVehicleById(id: string, payload: Partial<VehiclePayload>): Promise<VehicleDTO> {
  const b = base();
  if (!b) throw new Error('API base URL not configured');
  const url = `${b}/${encodeURIComponent(id)}`;
  return apiFetchJson<VehicleDTO>(url, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteVehicleById(id: string): Promise<void> {
  const b = base();
  if (!b) throw new Error('API base URL not configured');
  const url = `${b}/${encodeURIComponent(id)}`;
  await apiFetchJson(url, { method: 'DELETE' });
}
