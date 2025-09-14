"use client";
import { motion, type Variants } from 'framer-motion';
import { LucideProps, MoveRight } from 'lucide-react';
import React from 'react';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.4, 0.0, 0.2, 1] } },
};

interface PillarCardProps {
  icon: React.ElementType<LucideProps>;
  title: string;
  description: string;
}

export default function PillarCard({ icon: Icon, title, description }: PillarCardProps) {
  return (
    <motion.div
      className="group relative h-full w-full overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-8 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
      variants={cardVariants}
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 text-primary">
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="mt-6 text-2xl font-bold text-foreground">{title}</h3>
        <p className="mt-2 text-muted-foreground flex-grow">{description}</p>
        <a href="#" className="mt-6 flex items-center gap-2 text-sm font-semibold text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Learn More <MoveRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </div>
    </motion.div>
  );
}