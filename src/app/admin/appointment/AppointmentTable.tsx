"use client";
import React from "react";
import { Appointment } from "./page";

interface Props {
  appointments: Appointment[];
  onSelect: (a: Appointment) => void;
  onApprove: (id: number) => void;
}

export default function AppointmentTable({
  appointments,
  onSelect,
  onApprove,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border shadow-sm bg-white">
      <table className="min-w-full text-left border-collapse">
        <thead>
          <tr className="bg-primary text-white uppercase text-sm tracking-wider">
            <th className="px-4 py-3 font-semibold">Customer</th>
            <th className="px-4 py-3 font-semibold">Vehicle</th>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Service Type</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold text-center">View</th>
            <th className="px-4 py-3 font-semibold text-center">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border text-sm text-foreground font-body">
          {appointments.length > 0 ? (
            appointments.map((app) => (
              <tr
                key={app.id}
                className="hover:bg-primary/5 transition-colors duration-200 ease-in-out"
              >
                <td className="px-4 py-3 font-medium">{app.customerName}</td>
                <td className="px-4 py-3">{app.vehicleModel}</td>
                <td className="px-4 py-3">{app.date}</td>
                <td className="px-4 py-3">{app.serviceType}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      app.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : app.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {app.status}
                  </span>
                </td>

                {/* 🆕 View column */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onSelect(app)}
                    className="px-3 py-1.5 rounded-md text-blue-500 font-medium text-sm  transition-colors duration-200"
                  >
                    View
                  </button>
                </td>

                {/* Actions column */}
                <td className="px-4 py-3 text-center">
                  {app.status === "pending" ? (
                    <button
                      onClick={() => onApprove(app.id)}
                      className="px-3 py-1.5 rounded-md bg-green-500 text-white font-medium text-sm hover:bg-green-700 transition-colors duration-200"
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-md bg-gray-300 text-gray-600 font-medium text-sm cursor-not-allowed"
                    >
                      Actioned
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-6 text-center text-muted-foreground font-medium"
              >
                No appointments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
