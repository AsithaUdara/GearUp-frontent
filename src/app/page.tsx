// app/page.tsx
'use client'; // <-- This page is now a client component to manage state
import { useState } from 'react';

import Header from "@/app/components/landing/Header";
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

  return (
    <>
      {/* 2. Pass the function to open the modal down to the Header */}
      <Header onLoginClick={() => setIsModalOpen(true)} />
      
      {/* 3. Render the modal at the top level of the page */}
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <main>
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



