// lib/servicesData.ts
import { Cog, Car, ShieldCheck, Wrench, Battery, Droplets } from 'lucide-react';

export const serviceCategories = [
  {
    title: "Periodic Maintenance",
    services: [
      { name: "Washing Packages", icon: Car },
      { name: "Lube Services", icon: Droplets },
      { name: "Inspection Reports", icon: ShieldCheck },
    ]
  },
  {
    title: "Collision Repairs",
    services: [
      { name: "Full Paints", icon: Car },
      { name: "Part Replacements", icon: Wrench },
      { name: "Insurance Claims", icon: ShieldCheck },
    ]
  },
  {
    title: "Mechanical Repair",
    services: [
      { name: "Engine Diagnostics", icon: Cog },
      { name: "Hybrid Services", icon: Wrench },
      { name: "Battery Services", icon: Battery },
    ]
  },
];