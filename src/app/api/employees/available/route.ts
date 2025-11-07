// app/api/employees/route.ts
export async function GET() {
  try {
    // Call your backend service endpoint that talks to the DB
    const res = await fetch("http://localhost:8084/api/employees/available", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      // avoid Next.js caching if you want live data
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Backend responded with:", res.status);
      return new Response(
        JSON.stringify({ error: `Backend error ${res.status}` }),
        { status: res.status }
      );
    }

    const employees = await res.json();
    return Response.json(employees);
  } catch (err) {
    console.error("Failed to fetch employees from backend:", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch employees" }),
      { status: 500 }
    );
  }
}
