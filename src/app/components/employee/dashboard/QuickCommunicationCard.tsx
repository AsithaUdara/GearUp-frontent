"use client";
import { useRouter } from "next/navigation";

export default function QuickCommunicationCard() {
  const router = useRouter();

  const handleOpen = (template: string) => {
    const prefill = encodeURIComponent(
      template === 'update' ? 'Quick update: work in progress.' : template === 'delay' ? 'We are delayed due to parts. ETA update soon.' : 'Please approve the additional repair.'
    );
    router.push(`/employee/communication?prefill=${prefill}`);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Quick Communication</h3>
        <button onClick={() => router.push('/employee/communication')} className="text-sm text-red-600 hover:underline">Open</button>
      </div>

      <div className="mt-3 space-y-2">
        <button onClick={() => handleOpen('update')} className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm">Send quick update</button>
        <button onClick={() => handleOpen('delay')} className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm">Notify customer of delay</button>
        <button onClick={() => handleOpen('approve')} className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm">Request approval</button>
      </div>
    </div>
  );
}
