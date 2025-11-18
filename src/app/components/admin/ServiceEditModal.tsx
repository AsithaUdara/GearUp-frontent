// app/components/admin/ServiceEditModal.tsx
'use client';
import { X } from "lucide-react";
import type { ServiceTemplateDto } from '@/hooks/useServiceTemplates';
import { useEffect, useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  template: ServiceTemplateDto | null;
  createTemplate: (payload: ServiceTemplateDto) => Promise<ServiceTemplateDto>;
  updateTemplate: (id: number, payload: ServiceTemplateDto) => Promise<ServiceTemplateDto>;
  listTemplates: (page?: number, size?: number, activeOnly?: boolean) => Promise<{ items: ServiceTemplateDto[]; totalElements: number; totalPages: number; page: number; size: number }>;
  currentPage: number;
};

export default function ServiceEditModal({ isOpen, onClose, template, createTemplate, updateTemplate, listTemplates, currentPage }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>(0);
  const [durationMinutes, setDurationMinutes] = useState<number | ''>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; price?: string; durationMinutes?: string; description?: string }>({});
  // createTemplate, updateTemplate and listTemplates are passed from parent page to
  // ensure all components share the same templates state and updates are visible immediately.

  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description);
  setPrice(template.price);
  setDurationMinutes(template.durationMinutes);
      setErrors({});
    } else {
      setName('');
      setDescription('');
  setPrice(0);
  setDurationMinutes(0);
      setErrors({});
    }
  }, [template, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // run validations
    const p = Number(price);
    const d = Number(durationMinutes);
    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = 'Name is required.';
    if (name.trim().length > 150) nextErrors.name = 'Name must be 150 characters or fewer.';
    if (description && description.length > 2000) nextErrors.description = 'Description must be 2000 characters or fewer.';
    if (isNaN(p) || p < 0) nextErrors.price = 'Price must be a number ≥ 0.';
    if (isNaN(d) || d < 1) nextErrors.durationMinutes = 'Duration must be at least 1 minute.';
    if (!isNaN(d) && d > 480) nextErrors.durationMinutes = 'Duration must be at most 480 minutes.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const payload: ServiceTemplateDto = { name: name.trim(), description: description.trim(), price: p, durationMinutes: d, active: true };
    
    setIsSubmitting(true);
    try {
      if (template?.id) {
        await updateTemplate(template.id, payload);
      } else {
        await createTemplate(payload);
      }
      // Refresh list after successful create/update so table reflects new data
      const pageToUse = typeof currentPage === 'number' ? currentPage : 0;
      await listTemplates(pageToUse, 10);
      onClose();
    } catch (err: any) {
      console.error('Template save failed', err);
      // Map common backend validation messages to field errors for better UX
      const msg = err?.message || String(err || 'Unexpected error');
      const lower = msg.toLowerCase();
      if (lower.includes('name') || lower.includes('exists')) {
        setErrors(prev => ({ ...prev, name: msg }));
      } else if (lower.includes('duration')) {
        setErrors(prev => ({ ...prev, durationMinutes: msg }));
      } else if (lower.includes('price')) {
        setErrors(prev => ({ ...prev, price: msg }));
      } else {
        // generic fallback: attach to name as it's the primary field, and keep console for debugging
        setErrors(prev => ({ ...prev, name: msg }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-heading text-xl font-bold">{template ? 'Edit Service Template' : 'Add New Service Template'}</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <label className="text-sm font-medium">Service Name</label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(prev => ({ ...prev, name: undefined })); }}
              maxLength={150}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); if (errors.description) setErrors(prev => ({ ...prev, description: undefined })); }}
              rows={3}
              maxLength={2000}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Price (LKR)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => { setPrice(e.target.value === '' ? '' : Number(e.target.value)); if (errors.price) setErrors(prev => ({ ...prev, price: undefined })); }}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Duration (minutes)</label>
              <input
                type="number"
                min="1"
                max={480}
                value={durationMinutes}
                onChange={(e) => { setDurationMinutes(e.target.value === '' ? '' : Number(e.target.value)); if (errors.durationMinutes) setErrors(prev => ({ ...prev, durationMinutes: undefined })); }}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.durationMinutes && <p className="mt-1 text-sm text-red-600">{errors.durationMinutes}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-white hover:brightness-110 disabled:opacity-50 flex items-center gap-2">
              {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {isSubmitting ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
