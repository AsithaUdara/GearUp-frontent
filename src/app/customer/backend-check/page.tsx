'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getGatewayBase, getVehicleBase, getCustomerBase } from '@/lib/api/client';
import { getCustomer, createCustomer } from '@/lib/api/customers';
import { createVehicle, listVehiclesByUser } from '@/lib/api/vehicles';

export default function BackendCheckPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  function log(line: string) {
    setLogs((prev) => [new Date().toLocaleTimeString() + ' — ' + line, ...prev].slice(0, 200));
  }

  const gateway = getGatewayBase();
  const vehicleBase = getVehicleBase();
  const customerBase = getCustomerBase();
  const directMode = !gateway && !!vehicleBase && !!customerBase;
  const canRun = (!!gateway || directMode) && !!user;

  async function runChecks() {
    if (!user) return;
    setBusy(true);
    try {
      log('Starting backend connectivity checks...');
      // Ensure customer exists (idempotent-ish)
      try {
        const c = await getCustomer(user.uid);
        log(`GET /api/customers/${user.uid} → OK (email=${c.email || 'n/a'})`);
      } catch (e: any) {
        log(`GET /api/customers/${user.uid} → ${e.status || ''} creating...`);
        const c = await createCustomer({ firebaseUid: user.uid, email: user.email || `${user.uid}@example.local`, displayName: user.displayName || 'User' });
        log(`POST /api/customers → created (uid=${c.firebaseUid})`);
      }

      // Create a test vehicle
      const plate = `TEST-${Date.now().toString().slice(-6)}`;
      const v = await createVehicle({ make: 'Test', model: 'X', year: 2020, numberPlate: plate, photoURL: undefined });
      log(`POST /api/vehicles → created (id=${v.id}, plate=${v.numberPlate})`);

      // List vehicles by user
      const list = await listVehiclesByUser(user.uid);
      log(`GET /api/vehicles/user/${user.uid} → ${list.length} vehicles`);

      log('All checks completed.');
    } catch (err: any) {
      log(`Error: ${err?.message || String(err)}`);
      if (err?.body) log(`Error body: ${JSON.stringify(err.body)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Backend Connectivity Check</h1>
      <p className="text-sm text-gray-600 mb-4">
        This page calls the API Gateway with your Firebase ID token to create/read Customer and Vehicle resources.
      </p>
      <div className="mb-4 p-3 border rounded bg-gray-50 space-y-1">
        <p><strong>Gateway base:</strong> {gateway || '(not set)'}</p>
        <p><strong>Vehicle base:</strong> {vehicleBase || '(not set)'}</p>
        <p><strong>Customer base:</strong> {customerBase || '(not set)'}</p>
        <p><strong>Mode:</strong> {gateway ? 'Gateway' : directMode ? 'Direct (per-service bases)' : 'Not configured'}</p>
        <p><strong>User:</strong> {user ? user.uid : '(not signed in)'}</p>
      </div>
      <button
        onClick={runChecks}
        disabled={!canRun || busy}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {busy ? 'Running…' : 'Run checks'}
      </button>

      <div className="mt-6 space-y-1">
        {logs.map((l, i) => (
          <div key={i} className="text-sm font-mono whitespace-pre-wrap">{l}</div>
        ))}
      </div>
    </div>
  );
}
