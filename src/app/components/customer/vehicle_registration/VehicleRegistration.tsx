"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { LucideCar, LucideCalendar, LucideHistory, LucideSettings, LucideLogOut, LucideBot, LucideArrowLeft, LucideInfo } from "lucide-react";

const makes = ["Toyota", "Honda", "Ford", "Chevrolet", "Nissan"];

export default function VehicleRegistration() {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [numberPlate, setNumberPlate] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
  };

  return (
    <div className="flex min-h-screen bg-[#f8f6f6] font-display">
      {/* Sidebar */}
      <aside className="flex flex-col gap-y-6 border-r border-gray-200 bg-white p-4 md:w-64 lg:p-6 shrink-0">
        <a className="flex items-center gap-3 px-2 mb-6" href="#">
          <LucideCar className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary">Autocare</span>
        </a>
        <div className="flex flex-col items-start gap-4 border-b border-gray-200 pb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gray-200" />
            <div className="flex flex-col">
              <span className="text-base font-bold text-[#181111]">Alex Morgan</span>
              <span className="text-sm text-[#886364]">alex.morgan@email.com</span>
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-2 mt-4">
          <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#181111] hover:bg-gray-100 transition-colors" href="/customer/dashboard"><LucideCar className="text-[#181111]" /><span className="font-medium">Dashboard</span></a>
          <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#181111] hover:bg-gray-100 transition-colors" href="/customer/book-appointment"><LucideCalendar className="text-[#181111]" /><span className="font-medium">Book Appointment</span></a>
          <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#181111] hover:bg-gray-100 transition-colors" href="/customer/service-history"><LucideHistory className="text-[#181111]" /><span className="font-medium">Service History</span></a>
          <a className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-primary font-bold" href="/customer/vehicles"><LucideCar className="text-primary" /><span className="font-medium">My Vehicles</span></a>
          <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#181111] hover:bg-gray-100 transition-colors" href="/customer/settings"><LucideSettings className="text-[#181111]" /><span className="font-medium">Settings</span></a>
          <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#181111] hover:bg-gray-100 transition-colors" href="/customer/chatbot"><LucideBot className="text-[#181111]" /><span className="font-medium">AI Chatbot</span></a>
        </nav>
        <div className="mt-auto">
          <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#181111] hover:bg-gray-100 transition-colors" href="#"><LucideLogOut className="text-[#181111]" /><span className="font-medium">Logout</span></a>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1">
        <header className="flex h-20 items-center justify-between px-4 md:px-10 lg:px-20 border-b border-gray-200">
          <div></div>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white font-semibold hover:bg-primary/90 transition-colors">
            <LucideCar />
            <span>Book Appointment</span>
          </button>
        </header>
        <div className="flex h-full grow flex-col bg-[#f8f6f6]">
          <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-5">
            <div className="flex flex-col max-w-[960px] flex-1 bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center gap-4 p-4">
                <a className="flex items-center gap-2 text-[#886364] hover:text-primary transition-colors" href="/customer/vehicles">
                  <LucideArrowLeft />
                  <span className="font-medium">My Vehicles</span>
                </a>
              </div>
              <div className="flex flex-wrap justify-between gap-3 p-4">
                <div className="flex min-w-72 flex-col gap-3">
                  <p className="text-[#181111] text-4xl font-black leading-tight tracking-[-0.033em]">Add a New Vehicle</p>
                  <p className="text-[#886364] text-base font-normal leading-normal">Enter your vehicle's information to add it to your profile.</p>
                </div>
              </div>
              <h2 className="text-[#181111] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Vehicle Information</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-3">
                  <label className="flex flex-col">
                    <p className="text-[#181111] text-base font-medium leading-normal pb-2">Make</p>
                    <select className="form-select rounded-lg h-14 p-[15px] text-base font-normal leading-normal border border-[#e5dcdc] bg-white text-[#181111]" value={make} onChange={e => setMake(e.target.value)} required>
                      <option value="" disabled>Select Make</option>
                      {makes.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col">
                    <p className="text-[#181111] text-base font-medium leading-normal pb-2">Model</p>
                    <input className="form-input rounded-lg h-14 p-[15px] text-base font-normal leading-normal border border-[#e5dcdc] bg-white text-[#181111]" placeholder="e.g. Camry" value={model} onChange={e => setModel(e.target.value)} required />
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-3">
                  <label className="flex flex-col">
                    <p className="text-[#181111] text-base font-medium leading-normal pb-2">Year</p>
                    <input className="form-input rounded-lg h-14 p-[15px] text-base font-normal leading-normal border border-[#e5dcdc] bg-white text-[#181111]" placeholder="e.g. 2023" value={year} onChange={e => setYear(e.target.value)} required />
                  </label>
                  <div className="flex flex-col">
                    <div className="flex items-center pb-2">
                      <p className="text-[#181111] text-base font-medium leading-normal">Number Plate</p>
                      <span className="ml-2 cursor-pointer text-[#886364] text-lg"><LucideInfo /></span>
                    </div>
                    <input className="form-input rounded-lg h-14 p-[15px] text-base font-normal leading-normal border border-[#e5dcdc] bg-white text-[#181111]" placeholder="Enter vehicle number plate" value={numberPlate} onChange={e => setNumberPlate(e.target.value)} required />
                  </div>
                </div>
                <div className="flex px-4 py-8 justify-start">
                  <button type="submit" className="rounded-lg h-12 px-5 flex-1 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors">
                    <span className="truncate">Add Vehicle</span>
                  </button>
                </div>
                {success && (
                  <div className="mx-4 my-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    <p>Your {year} {make} {model} has been successfully added to your profile.</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
