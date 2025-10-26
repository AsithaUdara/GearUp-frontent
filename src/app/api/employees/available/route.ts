export async function GET() {
  const employees = [
    { id: 1, name: "Nimal Perera" },
    { id: 2, name: "Kamal Silva" },
  ];
  return Response.json(employees);
}
