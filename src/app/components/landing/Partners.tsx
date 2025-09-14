'use client';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

type PartnerLogo = { name: string; path: string; scale?: number };

const partnerLogos: PartnerLogo[] = [
  // Some SVGs have extra padding inside their viewBox; apply a base scale to normalize visual size.
  { name: 'Mobil 1', path: '/logos/mobil.svg', scale: 2.5 },
  { name: 'Bosch', path: '/logos/bosch.svg' },
  { name: 'Michelin', path: '/logos/michelin.svg' , scale: 3.2},
  { name: 'Brembo', path: '/logos/brembo.svg' },
  { name: 'Recaro', path: '/logos/recaro.svg', scale: 2.8 },
  { name: 'Pirelli', path: '/logos/pirelli.svg', scale: 2.5 },
  { name: 'K&N', path: '/logos/kn.svg', scale: 2.2 },
];

export default function Partners() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="py-24 bg-white"
    >
      <div className="container mx-auto px-6">
        <h3 className="text-center font-heading text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Trusted by the Industry&rsquo;s Best
        </h3>
        <div className="relative mt-12 w-full">
          <div className="absolute left-0 top-0 h-full w-28 md:w-32 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="w-full overflow-hidden">
            <div className="animate-marquee flex w-max items-center">
              {[...partnerLogos, ...partnerLogos].map((logo, index) => (
                <div key={index} className="mx-12 md:mx-16 flex-shrink-0">
                  <div
                    className="flex items-center justify-center"
                    style={{ transform: `scale(${logo.scale ?? 1})`, transformOrigin: 'center' }}
                  >
                    <Image
                      src={logo.path}
                      alt={`${logo.name} Logo`}
                      width={160}
                      height={64}
                      className="h-12 md:h-14 lg:h-16 w-auto object-contain grayscale transition-transform duration-300 hover:scale-110 hover:grayscale-0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-28 md:w-32 bg-gradient-to-l from-white to-transparent z-10" />
        </div>
      </div>
    </motion.section>
  );
}