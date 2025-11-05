import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params: _params }: { params: { id: string } }
) {
  const employeeId = _params.id;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  // Dummy free slots data for demonstration
  // In a real application, you would query a database based on employeeId and date
  const allFreeSlots = [
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "01:00 PM - 02:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
  ];

  // Simulate some variation based on employee ID or date if needed
  let freeSlotsForEmployee = [...allFreeSlots];
  if (employeeId === "1") {
    // Example: Nimal Perera has fewer slots
    freeSlotsForEmployee = freeSlotsForEmployee.filter(
      (slot) => !slot.includes("09:00 AM")
    );
  }
  // Further filter based on 'date' if required

  return NextResponse.json(freeSlotsForEmployee);
}
