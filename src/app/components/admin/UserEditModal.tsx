// app/components/admin/UserEditModal.tsx
'use client';
import { X, ChevronDown, Copy, CheckCircle } from "lucide-react";
import type { User } from '@/app/admin/users/page';
import { useEffect, useState, Fragment } from "react";
import { Listbox, Transition } from '@headlessui/react';
import { useAdminUsers } from '@/hooks/useAdminUsers';

type Props = { 
  isOpen: boolean; 
  onClose: () => void;
  user: User | null;
  onSuccess?: () => void;
};

const roles: Array<'Employee' | 'Admin' | 'Customer'> = ['Employee', 'Admin', 'Customer'];

export default function UserEditModal({ isOpen, onClose, user, onSuccess }: Props) {
  const { updateUser, createEmployee, loading, error } = useAdminUsers();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Employee' | 'Admin' | 'Customer'>('Employee');
  const [status, setStatus] = useState<'Active' | 'Deactivated'>('Active');
  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [copiedOTP, setCopiedOTP] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name); 
      setEmail(user.email); 
      setRole(user.role === 'No Role' ? 'Employee' : user.role as 'Employee' | 'Admin' | 'Customer'); 
      setStatus(user.status);
    } else {
      setName(''); setEmail(''); setRole('Employee'); setStatus('Active');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (user) {
        // Update existing user - parse name into first and last name
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || firstName;
        
        await updateUser(user.id, { 
          email,
          firstName,
          lastName,
          role: role.toUpperCase() as 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER',
          status 
        });
        alert('User updated successfully!');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        // Create new employee - get OTP response
        const response = await createEmployee({
          email,
          name,
          role: role.toUpperCase() as 'ADMIN' | 'EMPLOYEE',
          phoneNumber: undefined
        });
        
        // Show OTP modal if we got an OTP
        if (response && response.otp) {
          setOtpCode(response.otp);
          setShowOTP(true);
          // Don't close the modal yet - let user see and copy OTP
        } else {
          alert('Employee created successfully!');
          if (onSuccess) onSuccess();
          onClose();
        }
      }
    } catch (err) {
      console.error('Failed to save user:', err);
      alert(`Error: ${error || 'Failed to save user'}`);
    }
  };

  const handleCopyOTP = () => {
    navigator.clipboard.writeText(otpCode);
    setCopiedOTP(true);
    setTimeout(() => setCopiedOTP(false), 2000);
  };

  const handleCloseWithOTP = () => {
    setShowOTP(false);
    setOtpCode('');
    setCopiedOTP(false);
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-heading text-xl font-bold">{user ? `Edit User: ${user.name}` : 'Add New Employee'}</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <label className="text-sm font-medium">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
            />
          </div>
          <div>
            <label htmlFor="name" className="text-sm font-medium">Full Name</label>
            <input 
              id="name" 
              type="text"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Role</label>
              <Listbox value={role} onChange={setRole}>
                <div className="relative mt-1">
                  <Listbox.Button className="relative w-full cursor-default rounded-md border border-border bg-white py-2 pl-3 pr-10 text-left text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <span className="block truncate">{role}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><ChevronDown className="h-5 w-5 text-gray-400" /></span>
                  </Listbox.Button>
                  <Transition as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {roles.map((r) => (
                        <Listbox.Option key={r} value={r} className={({ active }) => `${active ? 'bg-primary/10 text-primary' : 'text-foreground'} relative cursor-default select-none py-2 pl-4 pr-4`}>
                          {r}
                        </Listbox.Option>
                      ))}
                      {user?.role === 'Customer' && (
                        <Listbox.Option value="Customer" disabled className="relative cursor-not-allowed select-none py-2 pl-4 pr-4 text-muted-foreground">
                          Customer
                        </Listbox.Option>
                      )}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
            {user && (
              <div>
                <label htmlFor="status" className="text-sm font-medium">Status</label>
                <select id="status" value={status} onChange={(e) => setStatus(e.target.value as 'Active' | 'Deactivated')} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Active</option>
                  <option>Deactivated</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 hover:bg-gray-200">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-white hover:brightness-110">Save Changes</button>
          </div>
        </form>
      </div>

      {/* OTP Display Modal */}
      {showOTP && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {role} Created Successfully!
              </h3>
              <p className="text-gray-600">
                Share this One-Time Password with the new user
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 mb-6 border-2 border-primary/20">
              <p className="text-xs uppercase tracking-wider text-gray-600 mb-2 text-center font-semibold">
                One-Time Password
              </p>
              <div className="text-4xl font-mono text-center tracking-[0.5em] font-bold text-primary mb-2">
                {otpCode}
              </div>
              <p className="text-xs text-gray-500 text-center">
                Valid for 24 hours
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-primary font-bold">1.</span>
                <p>Copy the OTP above</p>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-primary font-bold">2.</span>
                <p>Send it to the user via your preferred method</p>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-primary font-bold">3.</span>
                <p>User will use it to set their password at <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">/setup-password</span></p>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleCopyOTP}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                {copiedOTP ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy OTP
                  </>
                )}
              </button>
              <button 
                onClick={handleCloseWithOTP}
                className="flex-1 bg-gray-200 hover:bg-gray-300 px-6 py-3 rounded-lg font-medium transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
