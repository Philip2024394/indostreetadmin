import React from 'react';
import { Partner } from '../../types';

interface StatusControlProps {
    partner: Partner;
    onUpdate: (data: Partial<Partner>) => Promise<void>;
}

const StatusControl: React.FC<StatusControlProps> = ({ partner, onUpdate }) => {
    const currentStatus = partner.massageStatus || 'offline';

    const handleStatusChange = (status: 'online' | 'busy' | 'offline') => {
        let finalStatus: 'online' | 'busy' | 'offline' = status;

        // If therapist selects 'offline', randomly show therapist as busy status
        if (status === 'offline') {
            if (Math.random() < 0.5) { // 50% chance to appear busy
                finalStatus = 'busy';
            }
        }

        onUpdate({ massageStatus: finalStatus });
    };

    const statusConfig = {
        online: { text: 'Online', color: 'bg-green-500', hover: 'hover:bg-green-600', ring: 'ring-green-500' },
        busy: { text: 'Busy', color: 'bg-yellow-500', hover: 'hover:bg-yellow-600', ring: 'ring-yellow-500' },
        offline: { text: 'Offline', color: 'bg-red-500', hover: 'hover:bg-red-600', ring: 'ring-red-500' },
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Status</h3>
            <p className="text-sm text-gray-500 mb-4">Set your availability to appear in customer searches.</p>
            <div className="flex flex-col sm:flex-row gap-4">
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