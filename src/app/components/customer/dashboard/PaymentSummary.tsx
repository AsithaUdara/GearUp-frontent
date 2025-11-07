"use client";
import React from "react";
import { LucideCreditCard, LucideDollarSign, LucideReceipt, LucidePlus, LucideDownload } from "lucide-react";
import PaymentMethods, { PaymentMethod } from "./PaymentMethods";

type PaymentItem = {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "paid" | "pending" | "failed";
};

const mockPayments: PaymentItem[] = [
  { id: "p1", date: "2025-10-01", description: "Oil change", amount: 79.99, status: "paid" },
  { id: "p2", date: "2025-08-12", description: "Brake pad replacement", amount: 220.0, status: "paid" },
  { id: "p3", date: "2025-11-03", description: "Battery replacement (upcoming)", amount: 180.5, status: "pending" }
];

export default function PaymentSummary({ previousPayments, currentServices, onOpenAddCardAction } : { previousPayments?: PaymentItem[]; currentServices?: { id:string; description: string; amount:number }[]; onOpenAddCardAction?: () => void }) {
  const [payments, setPayments] = React.useState<PaymentItem[]>(previousPayments ?? mockPayments);
  const [query, setQuery] = React.useState("");
  const [selectedMethod, setSelectedMethod] = React.useState<PaymentMethod>({ type: "card" });

  const filtered = payments.filter((p) => p.description.toLowerCase().includes(query.toLowerCase()) || p.date.includes(query));

  const total = payments.reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.status === "pending");

  function handlePayNow() {
    if (selectedMethod.type === "cash") {
      // Simulate cash payment: mark pending as paid and add a note
      setPayments((prev) => prev.map((p) => (p.status === "pending" ? { ...p, status: "paid" } : p)));
      alert("Cash payment recorded. Please collect cash at the counter.");
      return;
    }

    if (selectedMethod.type === "invoice") {
      // Simulate creating an invoice
      downloadReceipt({ id: "invoice-" + Date.now(), items: pending, total });
      alert("Invoice generated and downloaded. You can pay at the service center.");
      return;
    }

    // For card or other online methods - simulate redirect to payment gateway
    alert(`Redirecting to ${selectedMethod.type} payment (simulated)...`);
  }

  function downloadReceipt({ id, items, total }: { id: string; items: PaymentItem[]; total: number }) {
    const lines = [
      `Receipt: ${id}`,
      `Date: ${new Date().toLocaleString()}`,
      "--------------------------",
      ...items.map((i) => `${i.date} · ${i.description} · $${i.amount.toFixed(2)}`),
      "--------------------------",
      `Total: $${total.toFixed(2)}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const subtotal = (currentServices ?? []).reduce((s, it) => s + it.amount, 0);

  return (
    <section className="p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white">
            <LucideCreditCard />
          </div>
          <div>
            <h2 className="text-[#181111] text-lg font-bold">Payments</h2>
            <p className="text-gray-500 text-sm">All your invoices and payment history</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search payments or date" className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
          <button onClick={onOpenAddCardAction} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg">
            <LucidePlus />
            <span className="text-sm font-medium">Add Payment Method</span>
          </button>
        </div>
      </div>

      {/* Current service subtotal (shows only when there are current service items) */}
      {currentServices && currentServices.length > 0 && (
        <div className="mb-4 p-4 bg-white rounded-lg border border-gray-100">
          <h4 className="text-sm font-medium text-[#181111] mb-2">Current service subtotal</h4>
          <ul className="mb-2">
            {currentServices.map((s) => (
              <li key={s.id} className="flex justify-between text-sm text-gray-700 py-1">
                <span>{s.description}</span>
                <span>${s.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center border-t border-gray-100 pt-3">
            <div className="text-sm text-gray-500">Subtotal</div>
            <div className="text-lg font-bold text-[#181111]">${subtotal.toFixed(2)}</div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto mb-4">
        <table className="w-full text-left">
          <thead>
            <tr className="text-sm font-medium text-gray-500 border-b border-gray-200">
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Description</th>
              <th className="py-2 px-4">Amount</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[#181111]">
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-gray-100">
                <td className="py-3 px-4 text-sm">{p.date}</td>
                <td className="py-3 px-4 text-sm">{p.description}</td>
                <td className="py-3 px-4 text-sm">${p.amount.toFixed(2)}</td>
                <td className="py-3 px-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'paid' ? 'bg-green-100 text-green-700' : p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm">
                  <div className="flex items-center gap-2">
                    {p.status === "pending" && (
                      <button onClick={() => { setPayments((prev) => prev.map((x) => x.id === p.id ? { ...x, status: 'paid' } : x)); }} className="text-sm px-3 py-1 rounded-lg bg-primary text-white">Mark paid</button>
                    )}
                    <button onClick={() => downloadReceipt({ id: `receipt-${p.id}`, items: [p], total: p.amount })} className="text-sm px-3 py-1 rounded-lg border border-gray-200"> <LucideDownload className="inline mr-1"/> Receipt</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
            <LucideReceipt />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Final amount (all-time)</p>
            <p className="text-[#181111] text-2xl font-bold flex items-center gap-2"><LucideDollarSign className="text-primary" />${total.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">{pending.length} pending</div>
          <PaymentMethods selected={selectedMethod} onSelectAction={setSelectedMethod} />
          <button onClick={handlePayNow} className="rounded-lg h-10 px-4 bg-primary text-white text-sm font-medium">Pay Now</button>
        </div>
      </div>
    </section>
  );
}
