// app/admin/services/page.tsx
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import ServicesToolbar from '@/app/components/admin/ServicesToolbar';
import ServicesTable from '@/app/components/admin/ServicesTable';
import ServiceEditModal from '@/app/components/admin/ServiceEditModal';
import { useServiceTemplates } from '@/hooks/useServiceTemplates';

// Use the shared DTO shape instead of redefining a mismatching type.
import type { ServiceTemplateDto } from '@/hooks/useServiceTemplates';

export default function ServicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ServiceTemplateDto | null>(null);

  // Single shared hook instance for the page so child components see the same state
  const templates = useServiceTemplates();
  const [currentPage, setCurrentPage] = useState(0);

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setIsModalOpen(true);
  };

  const handleEditTemplate = (template: ServiceTemplateDto) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-gray-900">Service Template Management</h1>
          <p className="mt-1 text-sm text-gray-600">Define, edit, and manage the services your business offers.</p>
        </div>

        <div className="mb-6">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
            <ServicesToolbar onNewTemplate={handleNewTemplate} />
          </div>
        </div>

        <div>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
            <ServicesTable
              onEditTemplate={handleEditTemplate}
              items={templates.items}
              listTemplates={templates.listTemplatesByPage}
              deleteTemplate={templates.deleteTemplate}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        <ServiceEditModal
          template={editingTemplate}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          createTemplate={templates.createTemplate}
          updateTemplate={templates.updateTemplate}
          listTemplates={templates.listTemplatesByPage}
          currentPage={currentPage}
        />
      </div>
    </motion.div>
  );
}