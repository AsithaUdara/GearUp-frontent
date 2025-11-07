"use client";
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';

const FeatureCard = ({ image, text }: { image: string, text: string }) => (
  <div className="relative h-48 overflow-hidden rounded-lg shadow-xl group">
    <Image
      src={image}
      alt={text}
      fill
      // Provide sizes to silence Next.js warning and improve responsive loading
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="object-cover transition-transform duration-500 group-hover:scale-110"
      priority
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
    <h3 className="absolute bottom-4 left-4 font-heading text-4xl font-bold text-white tracking-widest">{text}</h3>
  </div>
);
  
export default function About() {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
    return (
      <motion.section 
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="bg-white py-24"
      >
        <div className="container mx-auto grid grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
          <div>
            <p className="font-heading font-semibold text-primary">ABOUT US</p>
            <h2 className="font-heading mt-2 text-3xl font-bold text-foreground">
              Over 10 Years of Excellence in the Automotive Service Industry
            </h2>
            <p className="font-body mt-4 text-muted-foreground">
              GearUp is the nation&rsquo;s most trusted auto service network. We are committed to earning your business by providing the expertise, value, and responsiveness you expect, based on our three main pillars:
            </p>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FeatureCard image="/service-1.jpg" text="PROMPTNESS" />
              <FeatureCard image="/service-2.jpg" text="RESPECT" />
              <FeatureCard image="/service-3.jpg" text="ONENESS" />
              <a href="#" className="flex items-center justify-center rounded-lg bg-foreground text-white font-heading font-bold text-lg transition-colors hover:bg-primary">
                About Us
              </a>
            </div>
          </div>
          <div>
            <p className="font-heading font-semibold text-primary">OUR NETWORK</p>
            <h2 className="font-heading mt-2 text-3xl font-bold text-foreground">
              Over 15 State of the Art Facilities to Serve Across the Country
            </h2>
            <p className="font-body mt-4 text-muted-foreground">
              Our nationwide network covers a vast range of services, empowered by cutting-edge technology and certified experts to offer a superior vehicle service experience.
            </p>
            <a href="#" className="mt-8 inline-block rounded-md border-2 border-foreground bg-transparent px-8 py-3 font-heading font-bold text-foreground transition-all hover:bg-foreground hover:text-white">
              Branch Network
            </a>
          </div>
        </div>
      </motion.section>
    );
}