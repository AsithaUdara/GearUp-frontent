export default function CommunicationShortcuts() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h4 className="text-sm font-semibold mb-2">Quick Actions</h4>
      <div className="flex flex-col gap-2">
        <button className="w-full rounded-md border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Request Parts</button>
        <button className="w-full rounded-md border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Upload Docs</button>
        <button className="w-full rounded-md border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Quality Check</button>
      </div>
      <div className="mt-3">
        <label className="text-xs text-gray-500">Send quick note</label>
        <div className="mt-2 flex gap-2">
          <input placeholder="Write a quick note..." className="flex-1 rounded-md border px-3 py-2 text-sm" />
          <button className="rounded-md bg-red-600 px-3 py-2 text-white text-sm">Send</button>
        </div>
      </div>
    </div>
  );
}
