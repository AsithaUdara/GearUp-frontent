// app/admin/dashboard/page.tsx
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import StatsCard from '@/app/components/admin/StatsCard';
import RecentActivityCard from '@/app/components/admin/RecentActivityCard';
import QuickActionsCard from '@/app/components/admin/QuickActionsCard';
import NewAppointmentModal from '@/app/components/admin/NewAppointmentModal';
import UserEditModal from '@/app/components/admin/UserEditModal';
import PartRequestModal from '@/app/components/admin/PartRequestModal';
import ContactCustomerModal from '@/app/components/admin/ContactCustomerModal';

export default function AdminDashboard() {
  // State management for all modals, lifted up to the parent component
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPartRequestModalOpen, setIsPartRequestModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="font-heading text-3xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">A high-level overview of your service center's operations.</p>
      
      <div className="mt-8">
        <StatsCard />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivityCard />
        </div>
        <div>
          {/* Pass the handler functions down as props */}
          <QuickActionsCard 
            onNewAppointment={() => setIsNewAppointmentModalOpen(true)}
            onAddNewUser={() => setIsUserModalOpen(true)}
            onRequestParts={() => setIsPartRequestModalOpen(true)}
            onContactCustomer={() => setIsContactModalOpen(true)}
          />
        </div>
      </div>

      {/* Render all modals at the page level. */}
      <NewAppointmentModal 
        open={isNewAppointmentModalOpen}
        onClose={() => setIsNewAppointmentModalOpen(false)}
      />
      <UserEditModal 
        user={null} // Pass null to indicate "create new user" mode
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
      />
      <PartRequestModal
        isOpen={isPartRequestModalOpen}
        onClose={() => setIsPartRequestModalOpen(false)}
      />
      <ContactCustomerModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </motion.div>
  );
}
