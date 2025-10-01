"use client";

import { AnimatePresence, motion, type Variants } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MoveRight } from 'lucide-react';
import Image from 'next/image';

const textContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.5 } },
};
const textVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.4, 0.0, 0.2, 1] } },
};
// Removed unused breakoutImageVariants to satisfy eslint no-unused-vars

export default function Hero() {
  const slides = useMemo(() => [
    {
      id: 'slide-slogan-1',
      bgImage: '/slides/hero-bg-1.jpg',
      line1: '#1',
      line2: 'CAR SERVICE',
      line3: 'CHAIN IN SRI LANKA',
      buttonText: 'Learn more',
    },
    {
      id: 'slide-slogan-2',
      bgImage: '/slides/hero-bg-2.jpg',
      line1: '10 YEARS',
      line2: 'OF EXCELLENCE',
      line3: 'SINCE 2005',
      buttonText: 'Our History',
    },
    {
      id: 'slide-slogan-3',
      bgImage: '/slides/hero-bg-3.jpg',
      line1: 'STATE OF THE ART',
      line2: 'SERVICE CENTRES',
      line3: 'EMPOWERED WITH TECHNOLOGY',
      buttonText: 'View Facilities',
    },
  ], []);

  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);
  const hoveredRef = useRef(false);
  const next = () => setIndex((i) => (i + 1) % slides.length);
  const start = () => {
    if (timerRef.current != null) return;
    timerRef.current = window.setInterval(() => {
      if (!hoveredRef.current) next();
    }, 7000);
  };
  const stop = () => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  useEffect(() => {
    // Intentionally start slider once on mount; functions are stable
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentSlide = slides[index];

  // No foreground overlays

  return (
    <section
      className="relative w-full h-[90vh] min-h-[700px] bg-background pt-24"
      onMouseEnter={() => { hoveredRef.current = true; stop(); }}
      onMouseLeave={() => { hoveredRef.current = false; start(); }}
    >
      <div className="container mx-auto px-6 h-full">
        <div className="relative flex h-full items-center">
          <motion.div
            className="relative z-20 h-[80%] w-full rounded-lg bg-white p-8 shadow-2xl lg:w-1/2 lg:p-12"
            style={{ clipPath: 'polygon(0 0, 90% 0, 100% 100%, 0% 100%)' }}
            initial={{ clipPath: 'polygon(0 0, 0% 0, 0% 100%, 0% 100%)' }}
            animate={{ clipPath: 'polygon(0 0, 90% 0, 100% 100%, 0% 100%)' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex h-full flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide.id}
                  variants={textContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, transition: { duration: 0.3 } }}
                >
                  <motion.div variants={textVariants} className="font-heading uppercase">
                    <span className="block text-6xl md:text-7xl font-medium text-foreground">{currentSlide.line1}</span>
                    <span className="block text-7xl md:text-8xl font-bold text-primary mt-1">{currentSlide.line2}</span>
                    <span className="font-body block text-4xl md:text-5xl font-medium text-foreground mt-2">{currentSlide.line3}</span>
                  </motion.div>
                  <motion.div variants={textVariants}>
                    <a
                      href="#"
                      className="group relative mt-8 inline-flex items-center overflow-hidden rounded-md bg-primary px-8 py-4 font-heading text-base font-semibold uppercase text-primary-foreground shadow-lg shadow-primary/40 ring-1 ring-primary/80 transition-all duration-300 hover:bg-white hover:text-primary hover:shadow-2xl hover:shadow-primary/40"
                    >
                      <span className="absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-white/10"></span>
                      <span className="relative">{currentSlide.buttonText}</span>
                      <MoveRight className="relative ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
          <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-3/5 lg:block">
            <AnimatePresence>
              <motion.div
                key={currentSlide.id}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              >
                <Image
                  src={currentSlide.bgImage}
                  alt={currentSlide.line2}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover rounded-r-2xl"
                />
                {/* Foreground image removed */}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-6 z-30 flex justify-center gap-3">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIndex(i)}
            className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
              i === index ? 'w-8 bg-primary' : 'bg-black/20 hover:bg-black/40'
            }`}
          />
        ))}
      </div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-30 space-y-2">
          <div className="h-24 w-4 bg-foreground"></div>
          <div className="h-24 w-4 bg-primary"></div>
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-30 space-y-2">
          <div className="h-24 w-4 bg-foreground"></div>
          <div className="h-24 w-4 bg-primary"></div>
      </div>
    </section>
  );
}