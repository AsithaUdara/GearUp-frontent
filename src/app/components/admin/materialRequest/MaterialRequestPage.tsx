'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { InventoryStatus, MaterialRequest } from './types';
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
  const all = useMemo(createMock, []);
  const [items, setItems] = useState<MaterialRequest[]>(all);
  const [filters, setFilters] = useState<Filters>({ status: 'all', employee: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

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
    const s = { available: 0, low: 0, out: 0, fulfilled: 0 } as Record<'available'|'low'|'out'|'fulfilled', number>;
    for (const r of items) {
      if (r.status === 'fulfilled') s.fulfilled++;
      else if (r.inventoryStatus) s[r.inventoryStatus]++;
    }
    return s;
  }, [items]);

  function updateInventory(partNumber: string, status: InventoryStatus) {
    setItems((prev) => prev.map((i) => (i.partNumber === partNumber ? { ...i, inventoryStatus: status } : i)));
  }

  function fulfill(id: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'fulfilled' } : i)));
  }

  function orderExternally(id: string) {
    // For demo: mark as fulfilled as well, or keep pending. We'll mark fulfilled to mirror "Completed" action after ordering.
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'fulfilled' } : i)));
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

  // Dynamically size rows to fill available vertical space up to the bottom footer
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const compute = () => {
      if (!tbodyRef.current || !footerRef.current) return;
      const bodyTop = tbodyRef.current.getBoundingClientRect().top;
      const footerTop = footerRef.current.getBoundingClientRect().top;
      const available = Math.max(0, footerTop - bodyTop - 16); // padding
      // Estimate row height using the first row; fallback to 56px
      let rowH = 56;
      const firstRow = tbodyRef.current.querySelector('tr');
      if (firstRow) {
        const h = (firstRow as HTMLElement).getBoundingClientRect().height;
        if (h) rowH = h;
      }
      const newSize = Math.max(1, Math.floor(available / rowH));
      setPageSize((prev) => (prev !== newSize ? newSize : prev));
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [filtered.length]);

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
    <div className="w-full pl-4 pr-4 sm:pl-6 sm:pr-6 lg:pl-64 lg:pr-8 xl:pr-10 2xl:pr-12 pt-4 sm:pt-6 flex flex-col min-h-screen">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Material Request Management</h1>
          <p className="mt-1 text-sm text-gray-600">View and process material requests.</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-md bg-black text-white px-3 py-2 text-sm hover:bg-neutral-800">
            <Download className="h-4 w-4 text-red-500" /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-red-600" />
          <div>
            <div className="text-xs text-gray-500">Available</div>
            <div className="text-lg font-semibold text-gray-900">{stats.available}</div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-center gap-3">
          <Package className="h-5 w-5 text-red-600" />
          <div>
            <div className="text-xs text-gray-500">Low Stock</div>
            <div className="text-lg font-semibold text-gray-900">{stats.low}</div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-center gap-3">
          <PackageX className="h-5 w-5 text-red-600" />
          <div>
            <div className="text-xs text-gray-500">Out of Stock</div>
            <div className="text-lg font-semibold text-gray-900">{stats.out}</div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-center gap-3">
          <PackageCheck className="h-5 w-5 text-red-600" />
          <div>
            <div className="text-xs text-gray-500">Fulfilled</div>
            <div className="text-lg font-semibold text-gray-900">{stats.fulfilled}</div>
          </div>
        </div>
      </div>

      {/* Filters and inventory check removed per request */}

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Part Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Part Number</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Requested By</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Quantity</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody ref={tbodyRef} className="divide-y divide-gray-200">
            {pageItems.map((r) => {
              const statusLabel = r.status === 'fulfilled' ? 'fulfilled' : (r.inventoryStatus || 'out');
              const b = badge(statusLabel as any);
              const actionBtn = "inline-flex items-center justify-center rounded-md text-white text-sm font-medium w-36 py-1.5";
              return (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{r.partName}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{r.partNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{r.requestedBy}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{new Date(r.requestedAt).toISOString().slice(0,10)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{r.quantity}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium ${b.cls}`}>{b.label}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex justify-center">
                      {r.status === 'fulfilled' ? (
                        <span className="inline-flex items-center justify-center w-36 py-1.5 rounded-md border border-gray-300 bg-gray-100 text-gray-700">Completed</span>
                      ) : r.inventoryStatus === 'out' ? (
                        <button className={`${actionBtn} bg-black hover:bg-neutral-800`} onClick={() => orderExternally(r.id)}>
                          Order Externally
                        </button>
                      ) : (
                        <button className={`${actionBtn} bg-red-600 hover:bg-red-700`} onClick={() => fulfill(r.id)}>
                          Fulfill
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-600">No results.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

  {/* Footer: pagination – anchored to bottom of page */}
  <div ref={footerRef} className="mt-auto pt-6 flex items-center justify-between text-sm text-gray-600">
        <div>
          {`Showing ${showingFrom} to ${showingTo} of ${total} results`}
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={current === 1}
          >
            Previous
          </button>
          <button
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={current === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
