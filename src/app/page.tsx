// app/page.tsx
'use client'; // <-- This page is now a client component to manage state
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

import Header from "@/app/components/landing/Header";
import CustomerHeader from "@/app/components/customer/CustomerHeader";
import Hero from "@/app/components/landing/Hero";
import About from "@/app/components/landing/About";
import Services from "@/app/components/landing/Services";
import Testimonials from "@/app/components/landing/Testimonials";
import Partners from "@/app/components/landing/Partners";
import CallToAction from "@/app/components/landing/CallToAction";
import Footer from "@/app/components/landing/Footer";
import LoginModal from '@/app/components/login/LoginModal'; // <-- Import the modal here



export default function Home() {
  // 1. The state is now "lifted up" to the parent page component
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Show CustomerHeader if logged in, otherwise show regular Header */}
      {user ? (
        <CustomerHeader />
      ) : (
        <Header onLoginClick={() => setIsModalOpen(true)} />
      )}
      
      {/* 3. Render the modal at the top level of the page (only if not logged in) */}
      {!user && <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}

      <main className={user ? "pt-24" : ""}>
        <Hero />
        <About />
        <Services />
        <Testimonials />
        <Partners />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}


