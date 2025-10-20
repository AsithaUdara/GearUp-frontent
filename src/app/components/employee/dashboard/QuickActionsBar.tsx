import { PackagePlus, MessageSquareMore, Upload, ShieldCheck } from "lucide-react";

export default function QuickActionsBar() {
  const actions = [
    { id: "parts", label: "Request Parts", icon: PackagePlus },
    { id: "contact", label: "Contact Customer", icon: MessageSquareMore },
    { id: "upload", label: "Upload Docs", icon: Upload },
    { id: "qc", label: "Quality Check", icon: ShieldCheck },
  ];

  return (
    <div className="rounded-lg border border-white bg-white p-3 shadow-sm">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {actions.map(({ id, label, icon: Icon }) => (
          <button key={id} className="flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium hover:bg-gray-100">
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}
