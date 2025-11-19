// app/components/admin/ServicesTable.tsx
import { useEffect, useState } from 'react';
import type { ServiceTemplateDto } from '@/hooks/useServiceTemplates';
import { useAuth } from '@/context/AuthContext';
import DeleteConfirmModal from './DeleteConfirmModal';

type Props = {
  onEditTemplate: (template: ServiceTemplateDto) => void;
  items: ServiceTemplateDto[];
  listTemplates: (page?: number, size?: number, activeOnly?: boolean) => Promise<{ items: ServiceTemplateDto[]; totalElements: number; totalPages: number; page: number; size: number }>;
  deleteTemplate: (id: number) => Promise<boolean>;
  currentPage: number;
  onPageChange: (page: number) => void;
};

export default function ServicesTable({ onEditTemplate, items, listTemplates, deleteTemplate, currentPage, onPageChange }: Props) {

  const { user, loading: authLoading } = useAuth();
  const [deleting, setDeleting] = useState<{ id: number; name?: string } | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  // Only load templates after auth is initialized and user exists to ensure token is available
  useEffect(() => {
    if (!authLoading && user) {
      // request the current page
      listTemplates(currentPage, 10).then(pd => {
        if (pd?.totalPages !== undefined) setTotalPages(pd.totalPages);
      }).catch(() => {});
    }
  }, [authLoading, user, listTemplates, currentPage]);

  const confirmDelete = (id?: number, name?: string) => {
    if (!id) return;
    setDeleting({ id, name });
  };

  const doDelete = async () => {
    if (!deleting) return;
    try {
      await deleteTemplate(deleting.id);
      const pd = await listTemplates(currentPage, 10);
      if (pd?.totalPages !== undefined) setTotalPages(pd.totalPages);
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

      <div className="flex items-center justify-between p-4">
        <div className="text-sm text-muted-foreground">Page {currentPage + 1} of {totalPages || 1}</div>
        <div className="flex items-center gap-2">
          <button disabled={currentPage <= 0} onClick={() => onPageChange(Math.max(0, currentPage - 1))} className="px-3 py-1 rounded border disabled:opacity-50">Prev</button>
          <button disabled={currentPage >= Math.max(0, totalPages - 1)} onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))} className="px-3 py-1 rounded border disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}