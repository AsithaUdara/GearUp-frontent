export async function POST(request: Request) {
  const body = await request.json();
  console.log("Assigned:", body);
  return Response.json({
    success: true,
    message: "Employee assigned successfully!",
  });
}
