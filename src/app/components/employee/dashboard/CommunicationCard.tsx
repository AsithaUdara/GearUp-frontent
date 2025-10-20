export default function CommunicationCard() {
  return (
    <div className="rounded-lg border bg-white p-0 shadow-md">
      <div className="border-b px-6 py-4">
        <h3 className="text-xl font-bold">Customer Communication</h3>
      </div>
      <div className="flex flex-col h-[500px]">
        <div className="flex-1 space-y-4 p-6 overflow-y-auto bg-gray-50">
          <div className="flex items-start gap-3">
            <img alt="Customer avatar" className="w-10 h-10 rounded-full object-cover" src="https://i.pravatar.cc/40?u=john" />
            <div>
              <p className="font-semibold">John Doe <span className="ml-2 text-xs text-gray-500">10:32 AM</span></p>
              <div className="bg-gray-200 p-3 rounded-lg mt-1 max-w-xs">
                <p className="text-sm">Hi, just checking on the status of my Camry. Any updates?</p>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 justify-end">
            <div className="text-right">
              <div className="flex items-center justify-end">
                <span className="text-xs text-gray-500 mr-2">10:35 AM</span>
                <p className="font-semibold">You</p>
              </div>
              <div className="bg-red-600 text-white p-3 rounded-lg mt-1 inline-block">
                <p className="text-sm">Hi John, we're currently working on it. The oil change is almost done. We'll let you know once it's ready for pickup.</p>
              </div>
              <div className="flex items-center justify-end mt-1 text-xs text-gray-500">
                <span className="mr-1">Delivered</span>
                <span>✓✓</span>
              </div>
            </div>
            <img alt="Employee avatar" className="w-10 h-10 rounded-full object-cover" src="https://i.pravatar.cc/40?img=13" />
          </div>
        </div>
        <div className="p-4 border-t space-y-3">
          <div className="flex items-center">
            <button className="mr-3 p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-200">
              📎
            </button>
            <input className="flex-1 bg-white border rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-red-600" placeholder="Type a message to John Doe..." />
            <button className="ml-3 p-2 bg-red-600 text-white rounded-full hover:bg-red-700">➤</button>
          </div>
          <div className="flex gap-2">
            <button className="text-xs px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300">On my way.</button>
            <button className="text-xs px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300">Service is complete.</button>
            <button className="text-xs px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300">Okay, thanks!</button>
          </div>
        </div>
      </div>
    </div>
  );
}
