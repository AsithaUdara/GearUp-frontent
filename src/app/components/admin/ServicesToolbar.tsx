// app/components/admin/ServicesToolbar.tsx
import { Search, PlusCircle } from "lucide-react";

type Props = {
  onNewTemplate: () => void;
};

export default function ServicesToolbar({ onNewTemplate }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="relative flex-1 min-w-[250px]">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by service name..."
          className="w-full rounded-full border border-border bg-white py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </div>
      <button onClick={onNewTemplate} className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-4 py-2 text-sm font-medium hover:brightness-110">
        <PlusCircle className="h-4 w-4" /> Add New Template
      </button>
    </div>
  );
}
