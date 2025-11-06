'use client';

import { apiFetchJson, getGatewayBase, getCustomerBase } from './client';

function base(): string | undefined {
  // Dev proxy to avoid CORS in direct mode
  if (process.env.NEXT_PUBLIC_USE_DEV_PROXY === '1') {
    return '/api/proxy/customers';
  }
  const gw = getGatewayBase();
  if (gw) return `${gw.replace(/\/$/, '')}/api/customers`;
  const cb = getCustomerBase();
  if (cb) return `${cb.replace(/\/$/, '')}/api/customers`;
  return undefined;
}

export type CustomerDTO = {
  firebaseUid: string;
  email: string;
  displayName?: string;
  phone?: string;
  photoURL?: string;
  idNumber?: string;
  address?: string;
  birthday?: string;
  kycStatus?: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function getCustomer(uid: string): Promise<CustomerDTO> {
  const b = base();
  if (!b) throw new Error('API base URL not configured');
  const url = `${b}/${encodeURIComponent(uid)}`;
  return apiFetchJson<CustomerDTO>(url);
}

export async function createCustomer(payload: Partial<CustomerDTO> & { firebaseUid: string; email: string }): Promise<CustomerDTO> {
  const b = base();
  if (!b) throw new Error('API base URL not configured');
  return apiFetchJson<CustomerDTO>(b, { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateCustomer(uid: string, payload: Partial<CustomerDTO>): Promise<CustomerDTO> {
  const b = base();
  if (!b) throw new Error('API base URL not configured');
  const url = `${b}/${encodeURIComponent(uid)}`;
  return apiFetchJson<CustomerDTO>(url, { method: 'PUT', body: JSON.stringify(payload) });
}
