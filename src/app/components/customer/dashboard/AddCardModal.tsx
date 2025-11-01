"use client";
import React from "react";

export default function AddCardModal({ open, onCloseAction, onAddAction } : { open: boolean; onCloseAction: () => void; onAddAction: (card: { brand?: string; last4: string; exp: string; name: string }) => void }) {
  const [cardNumber, setCardNumber] = React.useState("");
  const [exp, setExp] = React.useState("");
  const [cvv, setCvv] = React.useState("");
  const [name, setName] = React.useState("");
  const [save, setSave] = React.useState(true);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const digits = cardNumber.replace(/\D/g, "");
    const last4 = digits.slice(-4);
  onAddAction({ brand: undefined, last4, exp, name });
    // reset
    setCardNumber(""); setExp(""); setCvv(""); setName(""); setSave(true);
  onCloseAction();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-[#181111] mb-3">Add new card</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">Card number</label>
            <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="1240 0125 0458 0124" className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500">Expiry date</label>
              <input value={exp} onChange={(e) => setExp(e.target.value)} placeholder="05/26" className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
            </div>
            <div style={{ width: 120 }}>
              <label className="text-xs text-gray-500">CVV/CVC</label>
              <input value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="575" className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">Cardholder name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mafhuzul Islam Nabil" className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} />
            <label className="text-sm text-gray-600">Save card (optional)</label>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onCloseAction} className="px-4 py-2 rounded-lg border border-gray-200">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white">Add card & continue</button>
          </div>
        </form>
      </div>
    </div>
  );
}
