'use client';

import React, { useEffect } from 'react';
import { Car, Wrench } from 'lucide-react';

// Add custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

interface AssignedModification {
    id: string;
    vehicleId: string;
    title: string;
    description: string;
    status: 'In Progress' | 'Completed';
    assignedDate: string;
}

interface AssignedModificationsProps {
    modifications: AssignedModification[];
    selectedModification: AssignedModification | null;
    onModificationSelect: (modification: AssignedModification) => void;
}

const AssignedModifications: React.FC<AssignedModificationsProps> = ({
    modifications,
    selectedModification,
    onModificationSelect
}) => {
    // Inject custom scrollbar styles
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = scrollbarStyles;
        document.head.appendChild(styleSheet);
        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    return (
        <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Assigned Modifications
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {modifications.map((mod) => (
                        <div
                            key={mod.id}
                            onClick={() => onModificationSelect(mod)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedModification?.id === mod.id
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-200 hover:border-red-300'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                        <Car className="h-4 w-4" />
                                        <span>Vehicle ID: {mod.vehicleId}</span>
                                    </div>
                                    <h3 className="font-medium">{mod.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{mod.description}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${
                                    mod.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                }`}>
                                    {mod.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AssignedModifications;
