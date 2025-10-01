import React from 'react';
import { Partner } from '../../types';

interface StatusControlProps {
    partner: Partner;
    onUpdate: (data: Partial<Partner>) => Promise<void>;
}

const StatusControl: React.FC<StatusControlProps> = ({ partner, onUpdate }) => {
    const currentStatus = partner.massageStatus || 'offline';

    const handleStatusChange = (status: 'online' | 'busy' | 'offline') => {
        onUpdate({ massageStatus: status });
    };

    const statusConfig = {
        online: { text: 'Online', color: 'bg-green-500', hover: 'hover:bg-green-600', ring: 'ring-green-500' },
        busy: { text: 'Busy', color: 'bg-yellow-500', hover: 'hover:bg-yellow-600', ring: 'ring-yellow-500' },
        offline: { text: 'Offline', color: 'bg-gray-500', hover: 'hover:bg-gray-600', ring: 'ring-gray-500' },
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Status</h3>
            <p className="text-sm text-gray-500 mb-4">Set your availability to appear in customer searches.</p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                {(['online', 'busy', 'offline'] as const).map((status) => {
                    const config = statusConfig[status];
                    const isActive = currentStatus === status;
                    return (
                        <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            className={`flex-1 py-3 px-4 rounded-lg text-white font-bold text-center transition-all duration-200 focus:outline-none ${config.color} ${config.hover} ${isActive ? `ring-4 ${config.ring} ring-offset-2` : ''}`}
                        >
                            {config.text}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default StatusControl;
