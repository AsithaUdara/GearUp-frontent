/**
 * Modifications API Client
 * 
 * Fetches modification request data from backend service (replaces Firestore)
 */

'use client';

import { api } from '../apiClient';

export type ModificationStatus = 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

export type Modification = {
  id: string;
  userId: string;
  vehicleId: string;
  vehicleLabel?: string;
  subject?: string;
  message: string;
  status: ModificationStatus;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateModificationDto = {
  vehicleId: string;
  subject?: string;
  message: string;
};

export type UpdateModificationDto = {
  status?: ModificationStatus;
  rejectionReason?: string;
};

/**
 * Get all modifications for current user
 */
export async function getUserModifications(userId: string): Promise<Modification[]> {
  return api.get<Modification[]>(`/api/modifications/user/${userId}`);
}

/**
 * Get ongoing modifications (pending, approved, in_progress)
 */
export async function getOngoingModifications(userId: string): Promise<Modification[]> {
  return api.get<Modification[]>(`/api/modifications/user/${userId}/ongoing`);
}

/**
 * Get modification by ID
 */
export async function getModification(modificationId: string): Promise<Modification> {
  return api.get<Modification>(`/api/modifications/${modificationId}`);
}

/**
 * Create new modification request
 */
export async function createModification(data: CreateModificationDto): Promise<Modification> {
  return api.post<Modification>('/api/modifications', data);
}

/**
 * Update modification status (admin only typically)
 */
export async function updateModification(
  modificationId: string,
  data: UpdateModificationDto
): Promise<Modification> {
  return api.patch<Modification>(`/api/modifications/${modificationId}`, data);
}

/**
 * Approve modification (admin)
 */
export async function approveModification(modificationId: string): Promise<Modification> {
  return api.patch<Modification>(`/api/modifications/${modificationId}/approve`, {});
}

/**
 * Reject modification (admin)
 */
export async function rejectModification(
  modificationId: string,
  reason: string
): Promise<Modification> {
  return api.patch<Modification>(`/api/modifications/${modificationId}/reject`, { reason });
}

/**
 * Mark modification in progress (admin)
 */
export async function markInProgress(modificationId: string): Promise<Modification> {
  return api.patch<Modification>(`/api/modifications/${modificationId}/in-progress`, {});
}

/**
 * Complete modification (admin)
 */
export async function completeModification(modificationId: string): Promise<Modification> {
  return api.patch<Modification>(`/api/modifications/${modificationId}/complete`, {});
}

/**
 * Delete modification
 */
export async function deleteModification(modificationId: string): Promise<void> {
  return api.delete(`/api/modifications/${modificationId}`);
}
