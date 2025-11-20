// export async function GET() {
//   const appointments = [
//     {
//       id: 1,
//       customerName: "Ravi Perera",
//       vehicleModel: "Toyota Corolla",
//       date: "2024-07-10",
//       timeSlot: "09:00 AM - 10:00 AM",
//       priority: "Urgent",
//       customerContact: { phone: "0771234567", email: "ravi.p@example.com" },
//       appointmentId: "APP001",
//       duration: 60,
//       requestedBay: "Bay A",
//       priceEstimate: 15000,
//       specialNotes: "Customer requested specific brand of oil.",
//       serviceType: "Oil Change",
//       status: "pending",
//     },
//     {
//       id: 2,
//       customerName: "Ayesha Fernando",
//       vehicleModel: "Honda Civic",
//       date: "2024-07-12",
//       timeSlot: "10:30 AM - 11:30 AM",
//       priority: "Normal",
//       customerContact: { phone: "0712345678", email: "ayesha.f@example.com" },
//       appointmentId: "APP002",
//       duration: 90,
//       requestedBay: "emp1", // Assigned to emp1
//       priceEstimate: 25000,
//       specialNotes: "Check tire pressure.",
//       serviceType: "Tire Replacement",
//       status: "approved",
//     },
//     {
//       id: 3,
//       customerName: "Saman Jayasuriya",
//       vehicleModel: "Nissan Sunny",
//       date: "2024-07-13",
//       timeSlot: "01:00 PM - 02:00 PM",
//       priority: "VIP",
//       customerContact: { phone: "0753456789", email: "saman.j@example.com" },
//       appointmentId: "APP003",
//       duration: 45,
//       requestedBay: "emp2", // Assigned to emp2
//       priceEstimate: 5000,
//       specialNotes: "Quick check only.",
//       serviceType: "Battery Check",
//       status: "completed",
//     },
//     {
//       id: 4,
//       customerName: "Thilini Abeysekara",
//       vehicleModel: "Suzuki Wagon R",
//       date: "2024-07-15",
//       timeSlot: "09:30 AM - 10:30 AM",
//       priority: "Normal",
//       customerContact: { phone: "0704567890", email: "thilini.a@example.com" },
//       appointmentId: "APP004",
//       duration: 120,
//       requestedBay: "emp1", // Assigned to emp1
//       priceEstimate: null,
//       specialNotes: "Customer will wait.",
//       serviceType: "Brake Inspection",
//       status: "pending",
//     },
//     {
//       id: 5,
//       customerName: "Kamal Silva",
//       vehicleModel: "Mazda 3",
//       date: "2024-07-16",
//       timeSlot: "02:00 PM - 03:00 PM",
//       priority: "Urgent",
//       customerContact: { phone: "0765678901", email: "kamal.s@example.com" },
//       appointmentId: "APP005",
//       duration: 180,
//       requestedBay: "emp3", // Assigned to emp3
//       priceEstimate: 35000,
//       specialNotes: "Engine knocking sound.",
//       serviceType: "Engine Tune-up",
//       status: "approved",
//     },
//     {
//       id: 6,
//       customerName: "Manoj Weerakoon",
//       vehicleModel: "Hyundai Tucson",
//       date: "2024-07-18",
//       timeSlot: "11:00 AM - 12:00 PM",
//       priority: "Normal",
//       customerContact: { phone: "0726789012", email: "manoj.w@example.com" },
//       appointmentId: "APP006",
//       duration: 30,
//       requestedBay: "emp2", // Assigned to emp2
//       priceEstimate: 8000,
//       specialNotes: "",
//       serviceType: "Air Filter Replacement",
//       status: "approved",
//     },
//     {
//       id: 7,
//       customerName: "Chathura Senanayake",
//       vehicleModel: "Mitsubishi Lancer",
//       date: "2024-07-19",
//       timeSlot: "08:30 AM - 09:30 AM",
//       priority: "Normal",
//       customerContact: { phone: "0777890123", email: "chathura.s@example.com" },
//       appointmentId: "APP007",
//       duration: 60,
//       requestedBay: "emp1", // Assigned to emp1
//       priceEstimate: 12000,
//       specialNotes: "Transmission fluid change.",
//       serviceType: "Transmission Check",
//       status: "pending",
//     },
//     {
//       id: 8,
//       customerName: "Nadeesha Ranasinghe",
//       vehicleModel: "BMW X3",
//       date: "2024-07-20",
//       timeSlot: "03:00 PM - 05:00 PM",
//       priority: "VIP",
//       customerContact: { phone: "0718901234", email: "nadeesha.r@example.com" },
//       appointmentId: "APP008",
//       duration: 120,
//       requestedBay: "emp3", // Assigned to emp3
//       priceEstimate: 50000,
//       specialNotes: "Full luxury service.",
//       serviceType: "Full Service",
//       status: "completed",
//     },
//     {
//       id: 9,
//       customerName: "Dinesh Rajapaksa",
//       vehicleModel: "Ford Ranger",
//       date: "2024-07-22",
//       timeSlot: "10:00 AM - 12:00 PM",
//       priority: "Urgent",
//       customerContact: { phone: "0759012345", email: "dinesh.r@example.com" },
//       appointmentId: "APP009",
//       duration: 90,
//       requestedBay: "emp2", // Assigned to emp2
//       priceEstimate: 20000,
//       specialNotes: "A/C not cooling.",
//       serviceType: "Air Conditioning Repair",
//       status: "pending",
//     },
//     {
//       id: 10,
//       customerName: "Ishara Wijesinghe",
//       vehicleModel: "Kia Sportage",
//       date: "2024-07-24",
//       timeSlot: "09:00 AM - 11:00 AM",
//       priority: "Normal",
//       customerContact: { phone: "0700123456", email: "ishara.w@example.com" },
//       appointmentId: "APP010",
//       duration: 60,
//       requestedBay: "emp1", // Assigned to emp1
//       priceEstimate: 10000,
//       specialNotes: "Check dashboard lights.",
//       serviceType: "Electrical Diagnostics",
//       status: "approved",
//     },
//   ];

//   return Response.json(appointments);
// }

// app/api/appointments/route.ts
import { NextResponse } from "next/server";

// This URL should point to your Spring Boot automobile-service (adjust port accordingly)

export async function GET() {
  try {
    const response = await fetch("http://localhost:8084/api/v1/bookings", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // cache: 'no-store' ensures you always get fresh data
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
