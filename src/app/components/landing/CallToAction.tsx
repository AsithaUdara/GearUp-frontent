'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MoveRight } from 'lucide-react';
import Image from 'next/image';

/*
==============================================================
  PROJECT APEX: THE CALL TO ACTION (CTA) SECTION
==============================================================
  - Rationale: The final conversion point. The design is high
  - contrast and visually striking to grab attention. The angled
  - image container creates thematic consistency with the hero.
  - The pulsing button acts as a clear focal point, guiding
  - the user to the primary action: booking an appointment.
==============================================================
*/

export default function CallToAction() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 1 }}
      className="bg-foreground"
    >
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2">
        {/* Left: Text Content */}
        <div className="px-6 py-24 text-white">
          <h2 className="font-heading text-4xl font-bold tracking-tight md:text-5xl">
            READY TO EXPERIENCE THE <span className="text-primary">DIFFERENCE</span>?
          </h2>
          <p className="font-body mt-6 max-w-lg text-lg text-gray-300">
            Book your appointment today and discover a new standard of automotive care. Our seamless digital experience is backed by expert technicians and a commitment to absolute transparency.
          </p>
          <a 
            href="#" 
            className="group relative mt-10 inline-flex items-center gap-3 overflow-hidden rounded-md bg-primary px-8 py-4 font-heading text-lg font-bold uppercase text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/40 animate-pulse-red"
          >
            <span className="absolute bottom-0 left-0 h-0 w-full bg-white/20 transition-all duration-500 group-hover:h-full"></span>
            <span className="relative">Book an Appointment</span>
            <MoveRight className="relative h-5 w-5" />
          </a>
        </div>

        {/* Right: Image */}
        <div className="relative hidden min-h-[400px] lg:block">
          <div 
            className="absolute inset-0 h-full w-full"
            style={{ clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 0% 100%)' }}
          >
            <Image 
              src="/cta-asset.png" 
              alt="High-performance vehicle part"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}