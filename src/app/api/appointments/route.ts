export async function GET() {
  const appointments = [
    {
      id: 1,
      customerName: "Ravi",
      vehicleModel: "Toyota Corolla",
      date: "2024-07-10",
      serviceType: "Oil Change",
      status: "pending",
    },
    {
      id: 2,
      customerName: "Ayesha",
      vehicleModel: "Honda Civic",
      date: "2024-07-12",
      serviceType: "Tire Replacement",
      status: "approved",
    },
  ];
  return Response.json(appointments);
}
