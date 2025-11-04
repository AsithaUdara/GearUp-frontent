// app/components/admin/ServicesTable.tsx
import type { ServiceTemplate } from '@/app/admin/services/page';

const mockTemplates: ServiceTemplate[] = [
  { id: 'svc_001', name: 'Oil Change & Filter', description: 'Complete oil change with premium filter replacement', price: 15000, duration: 30 },
  { id: 'svc_002', name: 'Full Service', description: 'Comprehensive vehicle inspection and maintenance', price: 45000, duration: 120 },
  { id: 'svc_003', name: 'Brake Service', description: 'Brake pad replacement and brake fluid check', price: 35000, duration: 90 },
];

type Props = {
  onEditTemplate: (template: ServiceTemplate) => void;
};

export default function ServicesTable({ onEditTemplate }: Props) {
  return (
    <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Service Name</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Price (LKR)</th>
              <th className="px-4 py-3 font-medium">Duration (min)</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockTemplates.map((template) => (
              <tr key={template.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-foreground">{template.name}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-sm truncate">{template.description}</td>
                <td className="px-4 py-3">{template.price.toLocaleString()}</td>
                <td className="px-4 py-3">{template.duration}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => onEditTemplate(template)} className="font-semibold text-primary hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
