"use client";
import { useRouter } from "next/navigation";

export default function ServiceProgressCard() {
  const router = useRouter();

  const services = [
    { id: 1, title: "Oil Change - Toyota Camry", progress: 65 },
    { id: 2, title: "Brake Inspection - Honda Civic", progress: 100 },
    { id: 3, title: "Tire Rotation - Ford F-150", progress: 30 },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Service Progress</h3>
        <span className="text-xs text-gray-500">Updated just now</span>
      </div>
      <div className="space-y-3">
        {services.map((s) => (
          <div key={s.id}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{s.title}</div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-500">{s.progress}%</div>
                <button
                  onClick={() => router.push(`/employee/service-progress?serviceId=${s.id}`)}
                  className="text-xs rounded-md border border-transparent px-3 py-1 text-red-600 hover:bg-red-50"
                >
                  View
                </button>
              </div>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
              <div className="h-2 rounded-full bg-red-600" style={{ width: `${s.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
