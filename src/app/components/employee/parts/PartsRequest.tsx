// src/app/components/employee/parts/PartsRequest.tsx
'use client';

import React, { useState, useEffect } from 'react';

// Define the type for a single request
interface MaterialRequest {
    id: string;
    material: string;
    quantity: number;
    status: 'Approved' | 'Pending' | 'Rejected';
    date: string;
}

// --- FIX APPLIED HERE ---
// Dummy data is now defined before the component uses it.
const initialPreviousRequests: MaterialRequest[] = [
    { id: 'REQ-2023-001', material: 'Brake Pads', quantity: 4, status: 'Approved', date: '2023-08-15' },
    { id: 'REQ-2023-002', material: 'Engine Oil 5L', quantity: 2, status: 'Pending', date: '2023-08-16' },
    { id: 'REQ-2023-003', material: 'Tires - Michelin Pilot Sport 4', quantity: 2, status: 'Rejected', date: '2023-08-17' },
];


const PartsRequest: React.FC = () => {
    // State for the form inputs
    const [partName, setPartName] = useState('');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [notes, setNotes] = useState('');
    
    // State to hold the list of previous requests
    const [previousRequests, setPreviousRequests] = useState<MaterialRequest[]>([]);

    // Fetch previous requests on component mount
    useEffect(() => {
        // In a real application, you would fetch this data from an API
        // For example: fetch('/api/parts/requests').then(...)
        setPreviousRequests(initialPreviousRequests);
    }, []);
    
    const getStatusClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!partName || !quantity) {
            alert('Please fill in both Part/Material Name and Quantity.');
            return;
        }

        console.log('Submitting new request:', {
            partName,
            quantity,
            notes
        });
        
        // In a real application, you would send this data to your backend API
        // and then refresh the list of previous requests.
        // For now, we can add it to our local state to see the UI update.
        
        const newRequest: MaterialRequest = {
            id: `REQ-2023-${String(previousRequests.length + 4).padStart(3, '0')}`,
            material: partName,
            quantity: Number(quantity),
            status: 'Pending',
            date: new Date().toISOString().split('T')[0], // format as YYYY-MM-DD
        };

        setPreviousRequests([newRequest, ...previousRequests]);
        
        // Clear the form
        setPartName('');
        setQuantity('');
        setNotes('');
    };

    return (
        <div className="bg-gray-50 p-6 sm:p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Parts & Materials Request</h2>

            {/* Request Form */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="part-name" className="block text-sm font-medium text-gray-700 mb-1">Part/Material Name</label>
                            <input 
                                type="text" 
                                id="part-name"
                                value={partName}
                                onChange={(e) => setPartName(e.target.value)}
                                placeholder="Enter part or material name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input 
                                type="number" 
                                id="quantity"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                                placeholder="Enter quantity"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            id="notes"
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any additional notes (e.g., VIN number, specific model)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                        ></textarea>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button type="submit" className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors duration-300">
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
            
            {/* Previous Requests Table */}
            <div className="mt-10">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Previous Requests</h3>
                <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part/Material</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {previousRequests.map((req) => (
                                <tr key={req.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{req.material}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{req.quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{req.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PartsRequest;