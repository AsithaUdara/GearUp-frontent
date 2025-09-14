'use client';

import { useInView } from 'react-intersection-observer';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter'; // Adjust path if needed
import { motion } from 'framer-motion';

const StatItem = ({ value, label }: { value: number, label: string }) => {
  const { ref: inViewRef, inView } = useInView({ triggerOnce: true, threshold: 0.5 });
  
  // The hook is now simpler to call
  const animatedRef = useAnimatedCounter({ to: inView ? value : 0 });

  // The corrected logic for combining the two refs
  const combinedRef = (node: HTMLParagraphElement) => {
    animatedRef.current = node;
    inViewRef(node);
  };
  
  return (
    <div className="text-center">
      <p ref={combinedRef} className="font-heading text-6xl font-bold text-primary">
        0 
      </p>
      <p className="mt-2 font-body text-sm uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
};

export default function Stats() {
  const stats = [
    { value: 500, label: "HAPPY CLIENTS" },
    { value: 10, label: "YEARS OF EXPERIENCE" },
    { value: 27, label: "EXPERT TEAM MEMBERS" },
  ];
  
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: inView ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className="bg-background py-24"
    >
      <div className="container mx-auto grid grid-cols-1 gap-12 md:grid-cols-3">
        {stats.map(stat => <StatItem key={stat.label} {...stat} />)}
      </div>
    </motion.div>
  );
}