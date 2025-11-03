// app/components/admin/QuickActionsCard.tsx
import { PackagePlus, MessageSquare, CalendarPlus, UserPlus } from "lucide-react";

type Props = {
  onNewAppointment: () => void;
  onRequestParts: () => void;
  onContactCustomer: () => void;
  onAddNewUser: () => void;
};

export default function QuickActionsCard({ 
  onNewAppointment,
  onRequestParts,
  onContactCustomer,
  onAddNewUser,
}: Props) {
  const actions = [
    { label: "New Appointment", icon: CalendarPlus, action: onNewAppointment },
    { label: "Request Parts", icon: PackagePlus, action: onRequestParts },
    { label: "Contact Customer", icon: MessageSquare, action: onContactCustomer },
    { label: "Add New User", icon: UserPlus, action: onAddNewUser },
  ];

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm h-full">
        <h3 className="font-heading text-xl font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
            {actions.map((action) => (
                <button 
                  key={action.label} 
                  onClick={action.action}
                  className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-gray-50 p-4 text-sm font-medium transition-colors hover:bg-primary/5 hover:text-primary"
                >
                    <action.icon className="h-6 w-6" />
                    <span>{action.label}</span>
                </button>
            ))}
        </div>
    </div>
  );
}
