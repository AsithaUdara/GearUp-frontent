"use client";
import React from "react";
import { Employee } from "./page";

interface Props {
  employees: Employee[];
  selectedEmpId: number | null;
  onChange: (id: number) => void;
}

export default function EmployeeSelect({
  employees,
  selectedEmpId,
  onChange,
}: Props) {
  return (
    <select
      value={selectedEmpId ?? ""}
      onChange={(e) => onChange(Number(e.target.value))}
      className="block w-full rounded-md border border-border bg-white px-3 py-2 
                 font-body text-sm text-foreground shadow-sm 
                 focus:border-primary focus:ring focus:ring-primary/30 
                 transition-all placeholder:text-muted-foreground"
    >
      <option value="">Choose an employee</option>
      {employees.map((emp) => (
        <option key={emp.id} value={emp.id}>
          {emp.name}
        </option>
      ))}
    </select>
  );
}
