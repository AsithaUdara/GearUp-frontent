// app/components/admin/ServicesTable.tsx
import { useEffect } from 'react';
import { useServiceTemplates, type ServiceTemplateDto } from '@/hooks/useServiceTemplates';

type Props = { onEditTemplate: (template: ServiceTemplateDto) => void };

export default function ServicesTable({ onEditTemplate }: Props) {
  const { items, listTemplates, deleteTemplate } = useServiceTemplates();

  // Initial load and refresh when component mounts; dependency array intentionally left
  // to only include listTemplates (stable via hook) so it runs once.
  useEffect(() => { listTemplates().catch(() => {}); }, [listTemplates]);

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
            {items.map((template) => (
              <tr key={template.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-foreground">{template.name}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-sm truncate">{template.description}</td>
                <td className="px-4 py-3">{Number(template.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-4 py-3">{template.durationMinutes}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => onEditTemplate(template)} className="font-semibold text-primary hover:underline">Edit</button>
                    <button onClick={() => template.id && deleteTemplate(template.id)} className="text-red-600 hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
