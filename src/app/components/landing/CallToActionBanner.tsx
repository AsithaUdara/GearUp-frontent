// app/components/CallToActionBanner.tsx
import Image from 'next/image';

export default function CallToActionBanner() {
  return (
    <section className="bg-primary text-white">
      <div className="container mx-auto grid grid-cols-1 items-center gap-8 px-6 py-12 md:grid-cols-2">
        <div>
          <h2 className="font-heading text-3xl font-bold">
            ROADSIDE ASSISTANCE
          </h2>
          <p className="font-heading mt-2 text-5xl font-extrabold tracking-wider">
            (208) 555-0112
          </p>
          <ul className="font-body mt-6 space-y-2">
            <li className="flex items-center gap-2">✔ Vehicle Breakdown Service</li>
            <li className="flex items-center gap-2">✔ Tyre Changing Service</li>
            <li className="flex items-center gap-2">✔ Roadside Repair Assistance</li>
          </ul>
        </div>
        <div className="h-64 rounded-lg overflow-hidden relative">
          <Image src="/roadside-assist.jpg" alt="Roadside Assistance" fill className="object-cover" />
        </div>
      </div>
    </section>
  );
}