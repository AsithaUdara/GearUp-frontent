"use client";
import React from "react";
import { LucideCreditCard, LucideWallet, LucideFileText } from "lucide-react";

export type PaymentMethod =
  | { type: "card"; label?: string }
  | { type: "cash"; label?: string }
  | { type: "invoice"; label?: string };

export default function PaymentMethods({ selected, onSelectAction }: { selected: PaymentMethod; onSelectAction: (m: PaymentMethod) => void; }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => onSelectAction({ type: "card" })} className={`px-3 py-2 rounded-lg text-sm ${selected.type === 'card' ? 'bg-primary text-white' : 'bg-white border border-gray-200'}`}>
        <LucideCreditCard className="inline mr-1"/> Card
      </button>
      <button onClick={() => onSelectAction({ type: "cash" })} className={`px-3 py-2 rounded-lg text-sm ${selected.type === 'cash' ? 'bg-primary text-white' : 'bg-white border border-gray-200'}`}>
        <LucideWallet className="inline mr-1"/> Cash
      </button>
      <button onClick={() => onSelectAction({ type: "invoice" })} className={`px-3 py-2 rounded-lg text-sm ${selected.type === 'invoice' ? 'bg-primary text-white' : 'bg-white border border-gray-200'}`}>
        <LucideFileText className="inline mr-1"/> Invoice
      </button>
    </div>
  );
}
