'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import AssignedModifications from './AssignedModifications';

// API types for parts request
interface PartsRequestPayload {
    modificationId: string;
    vehicleId: string;
    partName: string;
    quantity: number;
    notes?: string;
}

// Define the type for an assigned modification
interface AssignedModification {
    id: string;
    vehicleId: string;
    title: string;
    description: string;
    status: 'In Progress' | 'Completed';
    assignedDate: string;
}

// Define the type for a single request
interface MaterialRequest {
    id: string;
    material: string;
    quantity: number;
    status: 'Approved' | 'Pending' | 'Rejected';
    date: string;
}

const initialPreviousRequests: MaterialRequest[] = [
    { id: 'REQ-2023-001', material: 'Brake Pads', quantity: 4, status: 'Approved', date: '2023-08-15' },
    { id: 'REQ-2023-002', material: 'Engine Oil 5L', quantity: 2, status: 'Pending', date: '2023-08-16' },
    { id: 'REQ-2023-003', material: 'Tires - Michelin Pilot Sport 4', quantity: 2, status: 'Rejected', date: '2023-08-17' },
];

const initialAssignedModifications: AssignedModification[] = [
    {
        id: 'MOD-2023-001',
        vehicleId: 'VEH-001',
        title: 'Engine Performance Upgrade',
        description: 'Install high-performance air intake and tune ECU',
        status: 'In Progress',
        assignedDate: '2023-11-08'
    },
    {
        id: 'MOD-2023-002',
        vehicleId: 'VEH-002',
        title: 'Suspension Enhancement',
        description: 'Install sport suspension kit and lower springs',
        status: 'In Progress',
        assignedDate: '2023-11-09'
    }
];

const PartsRequest: React.FC = () => {
    // State for selected modification
    const [selectedModification, setSelectedModification] = useState<AssignedModification | null>(null);
    const [assignedModifications, setAssignedModifications] = useState<AssignedModification[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // State for the form inputs
    const [partName, setPartName] = useState('');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [notes, setNotes] = useState('');
    
    // State to hold the list of previous requests
    const [previousRequests, setPreviousRequests] = useState<MaterialRequest[]>([]);

    // Fetch previous requests on component mount
    useEffect(() => {
        setPreviousRequests(initialPreviousRequests);
    }, []);

    // Load assigned modifications
    useEffect(() => {
        setAssignedModifications(initialAssignedModifications);
    }, []);
    
    const getStatusClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleModificationSelect = (modification: AssignedModification) => {
        setSelectedModification(modification);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!selectedModification) {
            toast.error('Please select a modification first');
            return;
        }
        if (!partName || !quantity) {
            toast.error('Please fill in both Part/Material Name and Quantity');
            return;
        }

        try {
            setIsSubmitting(true);

            // Prepare the request payload
            const requestPayload: PartsRequestPayload = {
                modificationId: selectedModification.id,
                vehicleId: selectedModification.vehicleId,
                partName: partName,
                quantity: Number(quantity),
                notes: notes || undefined,
            };

            // TODO: Replace with actual API endpoint when backend is ready
            // const response = await fetch('/api/parts-request', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(requestPayload),
            // });

            // if (!response.ok) {
            //     throw new Error('Failed to submit request');
            // }

            // Temporary: Add to local state until API is integrated
            const newRequest: MaterialRequest = {
                id: `REQ-${new Date().getFullYear()}-${String(previousRequests.length + 1).padStart(3, '0')}`,
                material: partName,
                quantity: Number(quantity),
                status: 'Pending',
                date: new Date().toISOString().split('T')[0]
            };

            setPreviousRequests([newRequest, ...previousRequests]);
            
            // Clear form
            setPartName('');
            setQuantity('');
            setNotes('');
            
            // Show success message
            toast.success('Parts request submitted successfully');

        } catch (error) {
            console.error('Error submitting parts request:', error);
            toast.error('Failed to submit parts request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Assigned Modifications Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-6">Parts & Materials Request</h1>
                
                <AssignedModifications
                    modifications={assignedModifications}
                    selectedModification={selectedModification}
                    onModificationSelect={handleModificationSelect}
                />

                {/* Request Form Section */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Request Details</h2>
                        {!selectedModification ? (
                            <div className="text-center py-8 text-gray-500">
                                Please select a modification above to request parts or materials
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Selected Modification:</p>
                                    <p className="font-medium">{selectedModification.title}</p>
                                    <p className="text-sm text-gray-600">Vehicle ID: {selectedModification.vehicleId}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="partName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Part/Material Name
                                        </label>
                                        <input
                                            type="text"
                                            id="partName"
                                            value={partName}
                                            onChange={(e) => setPartName(e.target.value)}
                                            placeholder="Enter part or material name"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                                            Quantity
                                        </label>
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
                                        placeholder="Add any additional notes (e.g., specific model, requirements)"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                    ></textarea>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
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
        </div>
    );
};

export default PartsRequest;