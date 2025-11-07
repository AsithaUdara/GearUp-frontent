'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, KeyRound } from 'lucide-react';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/authService';
import PasswordChangeModal from './PasswordChangeModal';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

// Helper to call backend registration after Firebase sign-up
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FormInput = ({ id, type, placeholder, icon: Icon, value, onChange }: { 
  id: string, type: string, placeholder: string, icon: React.ElementType, value: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
}) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
    <input
      id={id}
      name={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-4 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      required
    />
  </div>
);

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [otpMode, setOtpMode] = useState(false); // First-time login via OTP
  const [showPwdChange, setShowPwdChange] = useState(false);
  const [pendingOtp, setPendingOtp] = useState<{ email: string; otp: string } | null>(null);
  
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    try {
      // 1) Create Firebase account
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const u = cred.user;
      // 2) Register in backend so profile exists
      const registerBody = {
        firebaseUid: u.uid,
        email: u.email ?? email,
        displayName: name || u.displayName || (email.split('@')[0] || 'Customer'),
        phoneNumber: u.phoneNumber || undefined,
        photoUrl: u.photoURL || undefined,
        role: 'CUSTOMER'
      };
      const res = await fetch(`${API_BASE_URL}/api/v1/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerBody),
        mode: 'cors'
      });
      if (!res.ok && res.status !== 409) {
        let msg = `HTTP ${res.status}`;
        try {
          const json = await res.json();
          msg = json?.message || msg;
        } catch {}
        throw new Error(`Backend registration failed: ${msg}`);
      }
      // 3) Immediately log in and redirect
      const { dashboardPath } = await loginUser(email, password);
      onClose();
      router.push(dashboardPath);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create account.';
      setError(message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // If first-time login with OTP, open password change modal and defer backend call
    if (otpMode) {
      if (!email || !password) {
        setError('Please enter email and OTP.');
        return;
      }
      setPendingOtp({ email, otp: password });
      setShowPwdChange(true);
      return;
    }

    try {
      // Normal login with Firebase password
      const { dashboardPath } = await loginUser(email, password);
      onClose();
      router.push(dashboardPath);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed.';
      setError(message);
    }
  };
  
  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setSuccessMessage('');
    setShowPassword(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-xl bg-white p-8 shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground transition-colors hover:text-foreground">
              <X className="h-6 w-6" />
            </button>

            <div className="text-center">
              <h2 className="font-heading text-3xl font-bold text-foreground">
                {isLoginView ? (otpMode ? 'First-time Login' : 'Welcome Back') : 'Create Account'}
              </h2>
              <p className="mt-2 font-body text-muted-foreground">
                {isLoginView 
                  ? (otpMode 
                      ? 'Enter your email and the 6-digit OTP you received from your admin.'
                      : 'Log in to access your dashboard.') 
                  : 'Sign up to get started.'}
              </p>
            </div>
            
            {successMessage && <div className="mt-4 p-3 rounded-md bg-green-100 text-green-800 text-center text-sm">{successMessage}</div>}
            {error && <div className="mt-4 p-3 rounded-md bg-red-100 text-red-800 text-center text-sm">{error}</div>}

            <form className="mt-6 space-y-4" onSubmit={isLoginView ? handleLogin : handleSignUp}>
              {!isLoginView && (
                <FormInput id="name" type="text" placeholder="Full Name" icon={User} value={name} onChange={(e) => setName(e.target.value)} />
              )}
              
              <FormInput id="email" type="email" placeholder="Email Address" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} />

              <div className="relative">
                {otpMode ? (
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                ) : (
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                )}
                <input
                  id="password"
                  name="password"
                  type={otpMode ? 'text' : (showPassword ? 'text' : 'password')}
                  placeholder={otpMode ? '6-digit OTP' : 'Password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-10 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
                {!otpMode && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-primary py-3 font-heading text-lg font-bold uppercase text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:brightness-110"
              >
                {isLoginView ? (otpMode ? 'Continue' : 'Log In') : 'Sign Up'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="font-body text-sm text-muted-foreground">
                {isLoginView ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={toggleView}
                  className="ml-1 font-semibold text-primary hover:underline"
                >
                  {isLoginView ? 'Sign Up' : 'Log In'}
                </button>
              </p>
              {isLoginView && (
                <p className="font-body text-xs text-muted-foreground mt-2">
                  First time here?{' '}
                  <button
                    type="button"
                    onClick={() => { setOtpMode(!otpMode); setError(''); setPassword(''); }}
                    className="ml-1 font-semibold text-primary hover:underline"
                  >
                    {otpMode ? 'Use password instead' : 'Use OTP (first login)'}
                  </button>
                </p>
              )}
            </div>
          </motion.div>

          {/* Password Change Modal for first-time login */}
          <PasswordChangeModal
            isOpen={showPwdChange}
            email={pendingOtp?.email || ''}
            otp={pendingOtp?.otp || ''}
            onClose={() => setShowPwdChange(false)}
            onSuccess={(dashboardPath) => {
              setShowPwdChange(false);
              onClose();
              router.push(dashboardPath);
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}