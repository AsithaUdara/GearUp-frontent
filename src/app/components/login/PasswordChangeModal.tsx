"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Lock, Eye, EyeOff } from 'lucide-react';
import { loginUser } from '@/lib/authService';

interface PasswordChangeModalProps {
  isOpen: boolean;
  email: string;
  otp: string; // 6-digit provided by admin for first-time login
  onClose: () => void;
  onSuccess: (dashboardPath: string) => void;
}

// Backend endpoint (existing single-step password setup)
const SETUP_PASSWORD_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/api/v1/auth/setup-password`;

export default function PasswordChangeModal({ isOpen, email, otp, onClose, onSuccess }: PasswordChangeModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!otp || otp.length !== 6) {
      setError('Invalid OTP.');
      return;
    }

    setLoading(true);
    try {
      // Call backend to set password (existing flow)
      const resp = await fetch(SETUP_PASSWORD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password: newPassword })
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || 'Failed to set password');
      }

      // After password setup, do normal Firebase login with new credentials
      const { dashboardPath } = await loginUser(email, newPassword);
      onSuccess(dashboardPath);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Setup failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-heading font-bold text-center">Set Your Password</h2>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Enter a new password to finish first-time login.
            </p>

            {error && (
              <div className="mt-4 p-3 rounded-md bg-red-100 text-red-800 text-center text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-10 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type={showConfirmPwd ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-10 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-primary py-3 font-heading text-lg font-bold uppercase text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:brightness-110 disabled:opacity-50"
              >
                {loading ? 'Setting...' : 'Set Password'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
