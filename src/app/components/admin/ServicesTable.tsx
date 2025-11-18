// app/components/admin/ServicesTable.tsx
import { useEffect, useState } from 'react';
import type { ServiceTemplateDto } from '@/hooks/useServiceTemplates';
import { useAuth } from '@/context/AuthContext';
import DeleteConfirmModal from './DeleteConfirmModal';

type Props = {
  onEditTemplate: (template: ServiceTemplateDto) => void;
  items: ServiceTemplateDto[];
  listTemplates: (activeOnly?: boolean) => Promise<ServiceTemplateDto[]>;
  deleteTemplate: (id: number) => Promise<boolean>;
};

export default function ServicesTable({ onEditTemplate, items, listTemplates, deleteTemplate }: Props) {

  const { user, loading: authLoading } = useAuth();
  const [deleting, setDeleting] = useState<{ id: number; name?: string } | null>(null);

  // Only load templates after auth is initialized and user exists to ensure token is available
  useEffect(() => {
    if (!authLoading && user) {
      listTemplates().catch(() => {});
    }
  }, [authLoading, user, listTemplates]);

  const confirmDelete = (id?: number, name?: string) => {
    if (!id) return;
    setDeleting({ id, name });
  };

  const doDelete = async () => {
    if (!deleting) return;
    try {
      await deleteTemplate(deleting.id);
      await listTemplates();
    } catch (err) {
      console.error('Delete failed', err);
    } finally {
      setDeleting(null);
    }
  };

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
                    <button onClick={() => confirmDelete(template.id, template.name)} className="text-red-600 hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <DeleteConfirmModal
        open={!!deleting}
        title="Delete Service Template"
        message={deleting ? `Delete "${deleting.name}"? This action cannot be undone.` : 'Delete this item?'}
        onConfirm={doDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}