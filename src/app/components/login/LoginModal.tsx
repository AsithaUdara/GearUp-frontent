'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';



interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Reusable Input Component with validation state
const FormInput = ({ id, type, placeholder, icon: Icon, error, value, onChange }: { 
  id: string, 
  type: string, 
  placeholder: string, 
  icon: React.ElementType,
  error?: string,
  value: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
}) => (
  <div>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full rounded-md border bg-background py-2 pl-10 pr-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
          error ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:border-primary focus:ring-primary/20'
        }`}
        required
      />
    </div>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

// --- The Main Modal Component ---
export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLoginView, setIsLoginView] = useState(true);
  
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  // State for form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // State for email validation
  const [emailError, setEmailError] = useState('');

  const validateEmail = (emailInput: string) => {
    if (!emailInput) {
      setEmailError('');
      return;
    }
    // Simple regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    validateEmail(e.target.value);
  };
  
  const toggleView = () => {
    // Reset fields and errors when switching views
    setIsLoginView(!isLoginView);
    setEmail('');
    setPassword('');
    setName('');
    setEmailError('');
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
                {isLoginView ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="mt-2 font-body text-muted-foreground">
                {isLoginView ? 'Log in to access your dashboard.' : 'Sign up to get started.'}
              </p>
            </div>

            <form className="mt-8 space-y-4">
              {!isLoginView && (
                <FormInput id="name" type="text" placeholder="Full Name" icon={User} value={name} onChange={(e) => setName(e.target.value)} />
              )}
              
              <FormInput id="email" type="email" placeholder="Email Address" icon={Mail} value={email} onChange={handleEmailChange} error={emailError} />

              {/* Password Field with Visibility Toggle */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-10 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
                <button
                  type="button" // Important: prevents form submission
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-primary py-3 font-heading text-lg font-bold uppercase text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:brightness-110"
              >
                {isLoginView ? 'Log In' : 'Sign Up'}
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}