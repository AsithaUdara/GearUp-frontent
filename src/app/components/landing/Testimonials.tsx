'use client';

import { motion, type Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Quote } from 'lucide-react';
import { testimonials as staticTestimonials } from '@/lib/testimonialsData';
import React from 'react';

// The landing testimonials show the static testimonials bundled with the app,
// plus any admin-published reviews stored in localStorage under
// 'publishedTestimonials'. This allows the admin panel to "publish to landing"
// without requiring a backend change.

/*
==============================================================
  PROJECT APEX: THE TESTIMONIALS SECTION
==============================================================
  - Rationale: Builds social proof and user trust. The design
  - is clean and professional, using cards that lift on hover
  - to create an interactive, engaging feel. Animations are
  - staggered to guide the eye across the content gracefully.
==============================================================
*/

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.4, 0.0, 0.2, 1] } },
};

export default function Testimonials() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [published, setPublished] = React.useState<Array<{ quote: string; name: string; service?: string }>>([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('publishedTestimonials');
      if (raw) setPublished(JSON.parse(raw));
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  const merged = [...staticTestimonials, ...(published || [])];

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
      className="bg-white py-24"
    >
      <div className="container mx-auto px-6">
        <motion.div variants={cardVariants} className="text-center">
          <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground">
            WHAT OUR <span className="text-primary">CLIENTS SAY</span>
          </h2>
          <p className="font-body mt-4 max-w-2xl mx-auto text-muted-foreground">
            Our commitment to excellence is reflected in the words of our customers and employees.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {merged.map((testimonial, index) => (
            <motion.div
              key={index}
              className="group relative flex h-full flex-col rounded-lg border border-border bg-background p-8 shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
              variants={cardVariants}
            >
              <Quote className="h-10 w-10 text-primary/20" />
              <p className="font-body mt-4 text-muted-foreground flex-grow">&quot;{testimonial.quote}&quot;</p>
              <div className="mt-6 border-t border-border pt-4">
                <p className="font-heading text-lg font-bold text-foreground">{testimonial.name}</p>
                {testimonial.service && <p className="font-body text-sm text-primary">{testimonial.service}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}