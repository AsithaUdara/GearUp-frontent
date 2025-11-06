export async function GET() {
  const employees = [
    { id: 1, name: "Nimal Perera" },
    { id: 2, name: "Kamal Silva" },
    { id: 3, name: "Saman Jayasuriya" },
    { id: 4, name: "Ashan Fernando" },
    { id: 5, name: "Mithun Abeysekara" },
    { id: 6, name: "Ruwan Samarasinghe" },
    { id: 7, name: "Tharindu Gunasekara" },
    { id: 8, name: "Chathura Senanayake" },
    { id: 9, name: "Dinesh Rajapaksa" },
    { id: 10, name: "Manoj Weerakoon" },
  ];

  return Response.json(employees);
}
