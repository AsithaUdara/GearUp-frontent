// src/app/components/employee/parts/PartsRequest.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { fetchTasksByEmployeeId, WorkTask } from '@/lib/workScheduleData';
import { useAuth } from '@/context/AuthContext';
import { Car, Wrench } from 'lucide-react';

// Define the type for a single request
interface MaterialRequest {
    id: string;
    material: string;
    quantity: number;
    status: 'Approved' | 'Pending' | 'Rejected';
    date: string;
    serviceId?: string;
    vehicle?: string;
}

// --- FIX APPLIED HERE ---
// Dummy data is now defined before the component uses it.
const initialPreviousRequests: MaterialRequest[] = [
    { id: 'REQ-2023-001', material: 'Brake Pads', quantity: 4, status: 'Approved', date: '2023-08-15' },
    { id: 'REQ-2023-002', material: 'Engine Oil 5L', quantity: 2, status: 'Pending', date: '2023-08-16' },
    { id: 'REQ-2023-003', material: 'Tires - Michelin Pilot Sport 4', quantity: 2, status: 'Rejected', date: '2023-08-17' },
];


const PartsRequest: React.FC = () => {
    const { user } = useAuth();
    const employeeId = "emp-1"; // TODO: Replace with actual employeeId from user profile or token

    // State for the form inputs
    const [partName, setPartName] = useState('');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [notes, setNotes] = useState('');
    const [serviceId, setServiceId] = useState('');
    const [vehicle, setVehicle] = useState('');
    
    // State to hold the list of previous requests
    const [previousRequests, setPreviousRequests] = useState<MaterialRequest[]>([]);
    
    // State for available tasks (for dropdown options)
    const [availableTasks, setAvailableTasks] = useState<WorkTask[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);

    // Fetch employee tasks to populate service ID and vehicle dropdowns
    useEffect(() => {
        const loadTasks = async () => {
            setIsLoadingTasks(true);
            try {
                const { assigned, currentTask } = await fetchTasksByEmployeeId(
                    employeeId,
                    user as { getIdToken?: () => Promise<string> } | null
                );
                const allTasks = currentTask ? [currentTask, ...assigned] : assigned;
                setAvailableTasks(allTasks);
            } catch (error) {
                console.error('Failed to load tasks:', error);
            } finally {
                setIsLoadingTasks(false);
            }
        };
        loadTasks();
    }, [employeeId, user]);

    // Fetch previous requests on component mount
    useEffect(() => {
        // In a real application, you would fetch this data from an API
        // For example: fetch('/api/parts/requests').then(...)
        setPreviousRequests(initialPreviousRequests);
    }, []);

    // Get unique vehicles from available tasks
    const uniqueVehicles = Array.from(new Set(availableTasks.map(task => task.vehicle))).sort();
    
    // Get service IDs for selected vehicle
    const serviceIdsForVehicle = vehicle
        ? availableTasks
            .filter(task => task.vehicle === vehicle)
            .map(task => ({ serviceId: task.serviceId, serviceType: task.serviceType }))
        : availableTasks.map(task => ({ serviceId: task.serviceId, serviceType: task.serviceType }));

    // Auto-select vehicle when service ID is selected
    const handleServiceIdChange = (selectedServiceId: string) => {
        setServiceId(selectedServiceId);
        const selectedTask = availableTasks.find(task => task.serviceId === selectedServiceId);
        if (selectedTask) {
            setVehicle(selectedTask.vehicle);
        }
    };

    // Auto-populate service IDs when vehicle is selected
    const handleVehicleChange = (selectedVehicle: string) => {
        setVehicle(selectedVehicle);
        // If only one service ID for this vehicle, auto-select it
        const tasksForVehicle = availableTasks.filter(task => task.vehicle === selectedVehicle);
        if (tasksForVehicle.length === 1) {
            setServiceId(tasksForVehicle[0].serviceId);
        } else if (tasksForVehicle.length > 1 && !serviceId) {
            // Clear service ID if multiple options available
            setServiceId('');
        }
    };
    
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
        if (!partName || !quantity || !serviceId || !vehicle) {
            alert('Please fill in all required fields: Vehicle, Service ID, Part/Material Name, and Quantity.');
            return;
        }

        console.log('Submitting new request:', {
            partName,
            quantity,
            notes,
            serviceId,
            vehicle
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
            serviceId: serviceId || undefined,
            vehicle: vehicle || undefined,
        };

        setPreviousRequests([newRequest, ...previousRequests]);
        
        // Clear the form
        setPartName('');
        setQuantity('');
        setNotes('');
        setServiceId('');
        setVehicle('');
    };

    return (
        <div className="bg-gray-50 p-4 sm:p-5 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Parts & Materials Request</h2>

            {/* Request Form */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="vehicle" className="block text-xs font-medium text-gray-700 mb-1">
                                <Car className="inline h-3.5 w-3.5 mr-1 text-red-600" />
                                Vehicle <span className="text-red-600">*</span>
                            </label>
                            <select
                                id="vehicle"
                                value={vehicle}
                                onChange={(e) => handleVehicleChange(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                required
                            >
                                <option value="">Select Vehicle</option>
                                {isLoadingTasks ? (
                                    <option disabled>Loading vehicles...</option>
                                ) : (
                                    uniqueVehicles.map((v) => (
                                        <option key={v} value={v}>
                                            {v}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="service-id" className="block text-xs font-medium text-gray-700 mb-1">
                                <Wrench className="inline h-3.5 w-3.5 mr-1 text-red-600" />
                                Service ID <span className="text-red-600">*</span>
                            </label>
                            <select
                                id="service-id"
                                value={serviceId}
                                onChange={(e) => handleServiceIdChange(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                required
                            >
                                <option value="">Select Service ID</option>
                                {isLoadingTasks ? (
                                    <option disabled>Loading services...</option>
                                ) : serviceIdsForVehicle.length === 0 ? (
                                    <option disabled>No services available</option>
                                ) : (
                                    serviceIdsForVehicle.map(({ serviceId, serviceType }) => (
                                        <option key={serviceId} value={serviceId}>
                                            {serviceId} - {serviceType}
                                        </option>
                                    ))
                                )}
                            </select>
                            {!vehicle && serviceId && (
                                <p className="mt-0.5 text-xs text-green-600">Vehicle will be auto-selected based on service ID</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label htmlFor="part-name" className="block text-xs font-medium text-gray-700 mb-1">Part/Material Name <span className="text-red-600">*</span></label>
                            <input 
                                type="text" 
                                id="part-name"
                                value={partName}
                                onChange={(e) => setPartName(e.target.value)}
                                placeholder="Enter part or material name"
                                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-xs font-medium text-gray-700 mb-1">Quantity <span className="text-red-600">*</span></label>
                            <input 
                                type="number" 
                                id="quantity"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                                placeholder="Enter quantity"
                                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label htmlFor="notes" className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            id="notes"
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any additional notes (e.g., VIN number, specific model)"
                            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 resize-y"
                        ></textarea>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button type="submit" className="bg-red-600 text-white text-sm font-semibold py-1.5 px-5 rounded-md hover:bg-red-700 transition-colors duration-200">
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
            
            {/* Previous Requests Table */}
            <div className="mt-5">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Previous Requests</h3>
                <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service ID</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part/Material</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {previousRequests.map((req) => (
                                <tr key={req.id}>
                                    <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900">{req.id}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-700">
                                        {req.vehicle ? req.vehicle : <span className="text-gray-400">N/A</span>}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-700">
                                        {req.serviceId ? req.serviceId : <span className="text-gray-400">N/A</span>}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-700">{req.material}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-700">{req.quantity}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-xs">
                                        <span className={`px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusClass(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-700">{req.date}</td>
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