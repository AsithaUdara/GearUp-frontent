'use client';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { serviceCategories } from '@/lib/servicesData';

const CategoryHeader = ({ title }: { title: string }) => (
    <div className="relative h-12 -skew-x-12 bg-primary flex items-center justify-center">
      <h3 className="skew-x-12 font-heading text-lg font-bold uppercase text-white">{title}</h3>
    </div>
);

export default function Services() {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
    return (
        <motion.section 
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="bg-background py-24"
        >
            <div className="container mx-auto px-6 text-center">
                <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground">
                OUR SERVICES
                </h2>
                <p className="font-body mt-4 max-w-2xl mx-auto text-muted-foreground">
                Committed to provide the best care with supervision and trust.
                </p>
            </div>
            <div className="container mx-auto mt-12 grid grid-cols-1 gap-x-8 gap-y-12 px-6 md:grid-cols-2 lg:grid-cols-3">
                {serviceCategories.map((category) => (
                <div key={category.title}>
                    <CategoryHeader title={category.title} />
                    <ul className="mt-6 space-y-4">
                    {category.services.map((service) => (
                        <li key={service.name}>
                        <a href="#" className="group flex items-center gap-4 text-muted-foreground transition-colors hover:text-primary">
                            <service.icon className="h-6 w-6 text-primary/70 transition-colors group-hover:text-primary" />
                            <span className="font-body text-lg">{service.name}</span>
                            <span className="ml-auto h-px flex-1 bg-border/50" />
                        </a>
                        </li>
                    ))}
                    </ul>
                </div>
                ))}
            </div>
        </motion.section>
    );
}