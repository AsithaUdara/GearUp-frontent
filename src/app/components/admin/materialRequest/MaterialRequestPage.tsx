'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { InventoryStatus, MaterialRequest, MaterialRequestStatus } from './types';
import { Download, Search, Calendar, Package, PackageCheck, PackageX, CheckCircle2, Filter, Eraser } from 'lucide-react';

// non-secure small id helper
const rid = (len = 8) => Math.random().toString(36).slice(2, 2 + len);

type Filters = {
  status: 'all' | 'pending' | 'fulfilled' | 'available' | 'low' | 'out';
  employee: string;
  from?: string; // yyyy-mm-dd
  to?: string;   // yyyy-mm-dd
};

function createMock(): MaterialRequest[] {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  return [
    { id: rid(), partName: 'Brake Pads', partNumber: 'BP-12345', quantity: 2, requestedBy: 'John Doe', requestedAt: iso(new Date(now.getTime() - 1000*60*60*24)), status: 'pending', inventoryStatus: 'available' },
    { id: rid(), partName: 'Oil Filter', partNumber: 'OF-67890', quantity: 1, requestedBy: 'Jane Smith', requestedAt: iso(new Date(now.getTime() - 1000*60*60*12)), status: 'pending', inventoryStatus: 'low' },
    { id: rid(), partName: 'Air Filter', partNumber: 'AF-11223', quantity: 1, requestedBy: 'Mike Johnson', requestedAt: iso(new Date(now.getTime() - 1000*60*60*48)), status: 'pending', inventoryStatus: 'out' },
    { id: rid(), partName: 'Spark Plugs', partNumber: 'SP-44556', quantity: 4, requestedBy: 'Sarah Lee', requestedAt: iso(new Date(now.getTime() - 1000*60*60*72)), status: 'fulfilled' },
    { id: rid(), partName: 'Alternator', partNumber: 'AL-77889', quantity: 1, requestedBy: 'David Chen', requestedAt: iso(new Date(now.getTime() - 1000*60*60*96)), status: 'pending', inventoryStatus: 'out' },
    { id: rid(), partName: 'Timing Belt', partNumber: 'TB-99001', quantity: 1, requestedBy: 'Anna Cruz', requestedAt: iso(new Date(now.getTime() - 1000*60*60*120)), status: 'pending', inventoryStatus: 'available' },
  ];
}

function badge(status: 'fulfilled' | InventoryStatus) {
  // Theme per request: Low Stock and Fulfilled shown as gray; Available green; Out red
  if (status === 'fulfilled') return { label: 'Fulfilled', cls: 'bg-gray-100 text-gray-700', icon: '▣' };
  if (status === 'available') return { label: 'Available', cls: 'bg-green-100 text-green-700', icon: '●' };
  if (status === 'low') return { label: 'Low Stock', cls: 'bg-gray-100 text-gray-700', icon: '⦿' };
  return { label: 'Out of Stock', cls: 'bg-red-100 text-red-700', icon: '●' };
}

export default function MaterialRequestPage() {
  const [items, setItems] = useState<MaterialRequest[]>([]);
  const [filters, setFilters] = useState<Filters>({ status: 'all', employee: '' });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6); // Fixed at 6 items per page
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch data from backend on mount
  useEffect(() => {
    async function fetchMaterialRequests() {
      try {
        setLoading(true);
        console.log('Fetching material requests from API...');
        const response = await fetch('http://localhost:9090/api/v1/parts-requests');
        console.log('Response status:', response.status);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const result = await response.json();
        console.log('API Response:', result);
        const data = result.content || [];
        console.log('Data items:', data.length);
        
        // Transform backend data to frontend format
        const transformed: MaterialRequest[] = data.map((item: any) => {
          // Map backend status to frontend status
          let frontendStatus: MaterialRequestStatus = 'pending';
          let inventoryStatus: InventoryStatus | undefined = undefined;
          
          if (item.status === 'APPROVED') {
            frontendStatus = 'approved';
            inventoryStatus = 'available';
          } else if (item.status === 'PENDING') {
            frontendStatus = 'pending';
            inventoryStatus = 'low';
          } else if (item.status === 'REJECTED') {
            frontendStatus = 'rejected';
            inventoryStatus = 'out';
          }
          
          return {
            id: item.id,
            partName: item.material,
            partNumber: item.requestId,
            quantity: item.quantity,
            requestedBy: item.notes || 'Unknown', // Using notes field temporarily
            requestedAt: item.createdAt,
            status: frontendStatus,
            inventoryStatus: inventoryStatus,
          };
        });
        
        setItems(transformed);
      } catch (error) {
        console.error('Error fetching material requests:', error);
        // Fallback to empty array on error
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMaterialRequests();
  }, []);

  // Filtering logic similar to the screenshot controls
  const filtered = items.filter((r) => {
    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'fulfilled') {
        if (r.status !== 'fulfilled') return false;
      } else {
        if (r.status === 'fulfilled') return false;
        if (r.inventoryStatus !== filters.status) return false;
      }
    }
    // Employee search
    if (filters.employee && !r.requestedBy.toLowerCase().includes(filters.employee.toLowerCase())) return false;
    // Date range
    if (filters.from && new Date(r.requestedAt) < new Date(filters.from)) return false;
    if (filters.to && new Date(r.requestedAt) > new Date(filters.to + 'T23:59:59')) return false;
    return true;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  // Summary stats for header cards
  const stats = useMemo(() => {
    const s = { approved: 0, rejected: 0, pending: 0, total: 0 };
    for (const r of items) {
      s.total++;
      if (r.status === 'approved') s.approved++;
      else if (r.status === 'rejected') s.rejected++;
      else if (r.status === 'pending') s.pending++;
    }
    return s;
  }, [items]);

  function updateInventory(partNumber: string, status: InventoryStatus) {
    setItems((prev) => prev.map((i) => (i.partNumber === partNumber ? { ...i, inventoryStatus: status } : i)));
  }

  async function updateStatus(id: string, newStatus: 'APPROVED' | 'REJECTED' | 'PENDING') {
    try {
      console.log(`Updating request ${id} to ${newStatus}`);
      const response = await fetch(`http://localhost:8093/api/v1/parts-requests/${id}/status?status=${newStatus}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedItem = await response.json();
      console.log('Updated item:', updatedItem);

      // Update local state
      setItems((prev) => prev.map((item) => {
        if (item.id === id) {
          let frontendStatus: MaterialRequestStatus = 'pending';
          let inventoryStatus: InventoryStatus | undefined = undefined;
          
          if (newStatus === 'APPROVED') {
            frontendStatus = 'approved';
            inventoryStatus = 'available';
          } else if (newStatus === 'PENDING') {
            frontendStatus = 'pending';
            inventoryStatus = 'low';
          } else if (newStatus === 'REJECTED') {
            frontendStatus = 'rejected';
            inventoryStatus = 'out';
          }

          return { ...item, status: frontendStatus, inventoryStatus };
        }
        return item;
      }));
      
      // Close the editing mode
      setEditingId(null);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  }

  // Inventory Check UI state
  const [checkPN, setCheckPN] = useState('');
  const [checkResult, setCheckResult] = useState<InventoryStatus | null>(null);

  const doCheck = () => {
    // Simple demo: cycle status
    const statuses: InventoryStatus[] = ['available', 'low', 'out'];
    const next = statuses[Math.floor(Math.random() * statuses.length)];
    setCheckResult(next);
    if (checkPN) updateInventory(checkPN, next);
  };

  const showingFrom = total ? start + 1 : 0;
  const showingTo = Math.min(start + pageSize, total);

  // Refs for table and footer
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // Convenience helpers for friendlier UX
  function clearFilters() {
    setFilters({ status: 'all', employee: '' });
    setPage(1);
  }

  function setQuickRange(days: 0 | 7 | 30) {
    const today = new Date();
    if (days === 0) {
      const iso = today.toISOString().slice(0, 10);
      setFilters((f) => ({ ...f, from: iso, to: iso }));
    } else {
      const from = new Date();
      from.setDate(today.getDate() - days);
      setFilters((f) => ({ ...f, from: from.toISOString().slice(0, 10), to: today.toISOString().slice(0, 10) }));
    }
    setPage(1);
  }

  // CSV export helpers
  function toCSV(rows: MaterialRequest[]) {
    const header = ['Part Name','Part Number','Requested By','Date','Quantity','Status','Inventory'];
    const body = rows.map(r => [
      r.partName,
      r.partNumber,
      r.requestedBy,
      new Date(r.requestedAt).toISOString(),
      String(r.quantity),
      r.status,
      r.inventoryStatus ?? ''
    ]);
    const csv = [header, ...body]
      .map(cols => cols.map(c => `"${String(c).replace(/"/g,'""')}"`).join(','))
      .join('\n');
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  }

  function exportCSV() {
    const blob = toCSV(filtered);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `material-requests-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="w-full flex flex-col min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Material Request Management</h1>
            <p className="mt-2 text-sm text-gray-600">Review and manage material requests from employees</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={exportCSV} 
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-red-700 shadow-sm transition-colors duration-200"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Requests */}
        <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Requests</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-blue-600">All material requests</span>
            </div>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.approved}</div>
                    <span className="ml-2 text-sm font-medium text-green-600">
                      {stats.total > 0 ? `${Math.round((stats.approved / stats.total) * 100)}%` : '0%'}
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-green-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-green-600">Ready to fulfill</span>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.pending}</div>
                    <span className="ml-2 text-sm font-medium text-yellow-600">
                      {stats.total > 0 ? `${Math.round((stats.pending / stats.total) * 100)}%` : '0%'}
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-yellow-600">Awaiting review</span>
            </div>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PackageX className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.rejected}</div>
                    <span className="ml-2 text-sm font-medium text-red-600">
                      {stats.total > 0 ? `${Math.round((stats.rejected / stats.total) * 100)}%` : '0%'}
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-red-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-red-600">Not approved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-4 sm:px-6 lg:px-8 mt-8">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Part Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Part Number</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Requested By</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody ref={tbodyRef} className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      <span className="ml-3">Loading requests...</span>
                    </div>
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 font-medium">No material requests found</p>
                  </td>
                </tr>
              ) : pageItems.map((r) => {
                const actionBtn = "inline-flex items-center justify-center rounded-lg text-sm font-medium px-4 py-2 transition-all duration-200";
                const isEditing = editingId === r.id;
                
                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.partName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">{r.partNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.requestedBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(r.requestedAt).toISOString().slice(0,10)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {r.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {isEditing ? (
                        <div className="flex justify-center gap-2">
                          <button 
                            className={`${actionBtn} bg-green-500 hover:bg-green-600 text-white shadow-sm`}
                            onClick={() => updateStatus(r.id, 'APPROVED')}
                          >
                            Approve
                          </button>
                          <button 
                            className={`${actionBtn} bg-red-500 hover:bg-red-600 text-white shadow-sm`}
                            onClick={() => updateStatus(r.id, 'REJECTED')}
                          >
                            Reject
                          </button>
                          <button 
                            className={`${actionBtn} bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm`}
                            onClick={() => updateStatus(r.id, 'PENDING')}
                          >
                            Pending
                          </button>
                          <button 
                            className={`${actionBtn} bg-gray-400 hover:bg-gray-500 text-white shadow-sm`}
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <button 
                            className={`${actionBtn} ${
                              r.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : 
                              r.status === 'rejected' ? 'bg-red-600 hover:bg-red-700' : 
                              'bg-yellow-600 hover:bg-yellow-700'
                            } text-white shadow-sm`}
                            onClick={() => setEditingId(r.id)}
                          >
                            {r.status === 'approved' ? 'Approved' : 
                             r.status === 'rejected' ? 'Rejected' : 
                             'Pending'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer: pagination */}
        <div ref={footerRef} className="mt-6 flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{showingFrom}</span> to <span className="font-medium">{showingTo}</span> of{' '}
            <span className="font-medium">{total}</span> results
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={current === 1}
            >
              Previous
            </button>
            <button
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={current === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
