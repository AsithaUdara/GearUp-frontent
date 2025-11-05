// app/admin/services/page.tsx
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import ServicesToolbar from '@/app/components/admin/ServicesToolbar';
import ServicesTable from '@/app/components/admin/ServicesTable';
import ServiceEditModal from '@/app/components/admin/ServiceEditModal';

export type ServiceTemplate = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
};

export default function ServicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ServiceTemplate | null>(null);

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setIsModalOpen(true);
  };

  const handleEditTemplate = (template: ServiceTemplate) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="font-heading text-3xl font-bold">Service Template Management</h1>
      <p className="mt-1 text-muted-foreground">Define, edit, and manage the services your business offers.</p>

      <div className="mt-8">
        <ServicesToolbar onNewTemplate={handleNewTemplate} />
      </div>

      <div className="mt-6">
        <ServicesTable onEditTemplate={handleEditTemplate} />
      </div>

      <ServiceEditModal 
        template={editingTemplate}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </motion.div>
  );
}
