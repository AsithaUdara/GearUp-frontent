'use client';
import { useState, useEffect } from 'react';
import { MoveRight, ChevronDown, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { serviceCategories } from '@/lib/servicesData';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function CustomerHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isServicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  
  // Check if we're on the appointment or modification page
  const isAppointmentPage = pathname === '/customer/appointment';
  const isModificationPage = pathname === '/customer/modification';
  const shouldHideButtons = isAppointmentPage || isModificationPage;
  
  const navLinks = ["HOME", "ABOUT US", "PACKAGES", "NEWS", "CONTACT"];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header 
      className={clsx(
        "fixed top-0 z-50 w-full transition-all duration-300",
        isScrolled ? "h-20 bg-glass-bg/80 shadow-md backdrop-blur-lg border-b border-glass-border" : "h-24 bg-transparent"
      )}
      onMouseLeave={() => {
        setServicesMenuOpen(false);
        setUserMenuOpen(false);
      }}
    >
      <div className="container mx-auto flex h-full items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logos/gearup_logo.png"
            alt="GearUp"
            priority
            width={160}
            height={64}
            className="h-14 md:h-16 lg:h-20 w-auto"
          />
          <span className="sr-only">GearUp</span>
        </Link>
        
        <nav className="hidden items-center gap-10 lg:flex">
          {navLinks.map((link) => {
            // Map navigation links to appropriate routes
            const getHref = (linkName: string) => {
              switch(linkName) {
                case 'HOME': return '/';
                case 'ABOUT US': return '/#about';
                case 'PACKAGES': return '/#services';
                case 'NEWS': return '/#news';
                case 'CONTACT': return '/#contact';
                default: return '/';
              }
            };
            
            return (
              <Link 
                key={link} 
                href={getHref(link)}
                className="group relative font-heading text-sm font-semibold tracking-wider uppercase text-foreground transition-colors hover:text-primary"
              >
                {link}
                <span className="absolute -bottom-2 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            );
          })}
          <div onMouseEnter={() => setServicesMenuOpen(true)}>
            <button className="group relative flex items-center gap-1 font-heading text-sm font-semibold tracking-wider uppercase text-foreground transition-colors hover:text-primary">
              SERVICES <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
              <span className="absolute -bottom-2 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-primary transition-all duration-300 group-hover:w-full" />
            </button>
          </div>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <div className={clsx("relative", shouldHideButtons && "invisible")} onMouseEnter={() => !shouldHideButtons && setUserMenuOpen(true)}>
            <button className="group relative inline-flex items-center gap-2 rounded-md border border-border px-5 py-3 font-heading text-sm font-bold uppercase text-foreground shadow-sm transition-colors duration-300 hover:border-primary hover:bg-primary/5">
              <User className="h-4 w-4" />
              <span>{user?.displayName || user?.email?.split('@')[0] || 'User'}</span>
              <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
            </button>
            
            <AnimatePresence>
              {isUserMenuOpen && !shouldHideButtons && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-border"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="py-2">
                    <Link href="/customer/dashboard" className="block px-4 py-2 text-sm text-foreground hover:bg-gray-100">Dashboard</Link>
                    <Link href="/customer/vehicles" className="block px-4 py-2 text-sm text-foreground hover:bg-gray-100">My Vehicles</Link>
                    <Link href="/customer/service-history" className="block px-4 py-2 text-sm text-foreground hover:bg-gray-100">Service History</Link>
                    <Link href="/customer/settings" className="block px-4 py-2 text-sm text-foreground hover:bg-gray-100">Settings</Link>
                    <hr className="my-2" />
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="inline h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <Link
            href="/customer/book-appointment"
            className={clsx(
              "group relative inline-flex items-center gap-2 overflow-hidden rounded-md bg-primary px-5 py-3 font-heading text-sm font-bold uppercase text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-primary/80 transition-all duration-300 hover:bg-white hover:text-primary",
              shouldHideButtons && "invisible"
            )}
          >
            <span className="absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-white/10" />
            <span className="relative">BOOK NOW</span>
            <MoveRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {isServicesMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute left-0 w-full bg-white shadow-xl"
            onMouseLeave={() => setServicesMenuOpen(false)}
          >
            <div className="container mx-auto grid grid-cols-1 gap-x-8 gap-y-10 px-6 py-10 md:grid-cols-3">
              {serviceCategories.map((category) => (
                <div key={category.title}>
                  <div className="relative mb-4 h-12 -skew-x-12 bg-primary flex items-center justify-center">
                    <h3 className="skew-x-12 font-heading text-lg font-bold uppercase text-white">{category.title}</h3>
                  </div>
                  <ul className="mt-6 space-y-4">
                    {category.services.map((service) => (
                      <li key={service.name}>
                        <Link href="/#services" className="group flex items-center gap-4 text-muted-foreground transition-colors hover:text-primary">
                          <service.icon className="h-6 w-6 text-primary/70 transition-colors group-hover:text-primary" />
                          <span className="font-body text-base">{service.name}</span>
                          <span className="ml-auto h-px flex-1 bg-border/50" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}