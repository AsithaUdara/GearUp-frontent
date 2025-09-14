'use client';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { LucideProps } from 'lucide-react';
import React from 'react';

interface FeatureCardProps {
  icon: React.ElementType<LucideProps>;
  title: string;
  description: string;
}

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
  const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div 
      className="group relative w-full rounded-2xl border border-glass-border bg-glass-bg p-6 shadow-lg backdrop-blur-lg"
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(400px circle at ${mouseX}px ${mouseY}px, var(--color-glow), transparent 80%)
          `,
        }}
      />
      <div className="relative z-10">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/80 shadow-inner">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-bold text-lg text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}