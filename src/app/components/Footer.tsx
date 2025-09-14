// app/components/Footer.tsx
import { MoveRight } from 'lucide-react';
import Image from 'next/image';

const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <li>
      <a href={href} className="text-muted-foreground transition-colors duration-300 hover:text-primary">
        {children}
      </a>
    </li>
);
  
export default function Footer() {
    const currentYear = new Date().getFullYear();
  
    return (
      <footer className="border-t border-border bg-white">
        <div className="container mx-auto px-6 pt-24 pb-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/logos/gearup_logo.png"
                  alt="GearUp"
                  width={160}
                  height={64}
                  priority
                  className="h-auto w-auto max-h-14 md:max-h-16 lg:max-h-20"
                />
                <span className="sr-only">GearUp</span>
              </div>
              <p className="font-body mt-4 max-w-xs text-muted-foreground">
                The intersection of artistry and engineering. Precision is our language.
              </p>
              <p className="font-heading mt-8 font-semibold text-foreground">
                Stay Ahead of the Curve
              </p>
              <form className="mt-4 flex items-center gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-md border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="flex-shrink-0 rounded-md bg-primary p-2 text-primary-foreground transition-transform hover:scale-105"
                >
                  <MoveRight className="h-6 w-6" />
                </button>
              </form>
            </div>
  
            <div className="lg:col-span-1" />
  
            <div className="lg:col-span-2">
              <h4 className="font-heading font-semibold text-foreground">Services</h4>
              <ul className="mt-4 space-y-3 font-body text-sm">
                <FooterLink href="#">Maintenance</FooterLink>
                <FooterLink href="#">Mechanical Repair</FooterLink>
                <FooterLink href="#">Collision & Body</FooterLink>
                <FooterLink href="#">Diagnostics</FooterLink>
              </ul>
            </div>
  
            <div className="lg:col-span-2">
              <h4 className="font-heading font-semibold text-foreground">Company</h4>
              <ul className="mt-4 space-y-3 font-body text-sm">
                <FooterLink href="#">About Us</FooterLink>
                <FooterLink href="#">Our Team</FooterLink>
                <FooterLink href="#">Careers</FooterLink>
                <FooterLink href="#">Blog</FooterLink>
              </ul>
            </div>
  
            <div className="lg:col-span-2">
              <h4 className="font-heading font-semibold text-foreground">Contact</h4>
              <ul className="mt-4 space-y-3 font-body text-sm text-muted-foreground">
                <li>info@gearup.com</li>
                <li>(208) 555-0112</li>
                <li>123 Auto Lane, Boise, ID</li>
              </ul>
            </div>
          </div>
  
          <div className="mt-16 flex flex-col items-center justify-between border-t border-border pt-8 sm:flex-row">
            <p className="font-body text-sm text-muted-foreground">
              &copy; {currentYear} GearUp Industries. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    );
}