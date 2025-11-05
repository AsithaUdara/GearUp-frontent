export default function CommunicationShortcuts() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h4 className="text-sm font-semibold mb-2">Quick Actions</h4>
      <div className="flex flex-col gap-2">
        <button className="w-full rounded-md border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Request Parts</button>
        <button className="w-full rounded-md border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Upload Docs</button>
        <button className="w-full rounded-md border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Quality Check</button>
      </div>
  
    </div>
  );
}
