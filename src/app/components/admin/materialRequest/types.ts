export type InventoryStatus = 'available' | 'low' | 'out';

export type MaterialRequestStatus = 'pending' | 'approved' | 'rejected' | 'fulfilled';

export type MaterialRequest = {
  id: string;
  partName: string;
  partNumber: string;
  quantity: number;
  requestedBy: string; // employee name or id
  requestedAt: string; // ISO timestamp
  status: MaterialRequestStatus;
  inventoryStatus?: InventoryStatus; // set when checked
  details?: string;
  approverNote?: string;
};
