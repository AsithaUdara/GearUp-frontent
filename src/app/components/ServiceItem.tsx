"use client";
import { motion, type Variants } from 'framer-motion';
import { LucideProps, MoveRight } from 'lucide-react';
import React from 'react';

export const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] } },
};

interface ServiceItemProps {
  icon: React.ElementType<LucideProps>;
  name: string;
}

export default function ServiceItem({ icon: Icon, name }: ServiceItemProps) {
  return (
    <motion.a href="#" className="group relative flex w-full cursor-pointer items-center gap-4 rounded-lg p-4 transition-colors duration-300 hover:bg-white/10" variants={itemVariants}>
      <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md border border-glass-border bg-white/5 transition-colors duration-300 group-hover:border-primary group-hover:bg-primary">
        <Icon className="h-6 w-6 text-muted-foreground transition-colors duration-300 group-hover:text-white" />
      </div>
      <span className="relative z-10 font-medium text-muted-foreground transition-colors duration-300 group-hover:text-foreground">{name}</span>
      <MoveRight className="relative z-10 ml-auto h-5 w-5 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" style={{ transform: 'translateX(-10px)' }}/>
    </motion.a>
  );
}