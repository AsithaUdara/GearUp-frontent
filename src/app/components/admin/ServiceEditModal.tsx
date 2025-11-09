// app/components/admin/ServiceEditModal.tsx
'use client';
import { X } from "lucide-react";
import type { ServiceTemplateDto } from '@/hooks/useServiceTemplates';
import { useServiceTemplates } from '@/hooks/useServiceTemplates';
import { useEffect, useState } from "react";

type Props = { 
  isOpen: boolean; 
  onClose: () => void;
  template: ServiceTemplateDto | null;
};

export default function ServiceEditModal({ isOpen, onClose, template }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>(0);
  const [durationMinutes, setDurationMinutes] = useState<number | ''>(0);
  const { createTemplate, updateTemplate, listTemplates } = useServiceTemplates();

  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description);
  setPrice(template.price);
  setDurationMinutes(template.durationMinutes);
    } else {
      setName('');
      setDescription('');
  setPrice(0);
  setDurationMinutes(0);
    }
  }, [template, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  const p = Number(price);
  const d = Number(durationMinutes);
  if (!name.trim()) return;
  if (isNaN(p) || p < 0) return;
  if (isNaN(d) || d < 1) return;
  const payload: ServiceTemplateDto = { name: name.trim(), description: description.trim(), price: p, durationMinutes: d, active: true };
    try {
      if (template?.id) {
        await updateTemplate(template.id, payload);
      } else {
        await createTemplate(payload);
      }
      // Refresh list after successful create/update so table reflects new data
      await listTemplates();
      onClose();
    } catch (err) {
      console.error('Template save failed', err);
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
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Price (LKR)</label>
              <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Duration (minutes)</label>
              <input type="number" min="1" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 hover:bg-gray-200">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-white hover:brightness-110">Save Template</button>
          </div>
        </form>
      </div>
    </div>
  );
}
