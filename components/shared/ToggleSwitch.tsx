
import React from 'react';

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  enabledText?: string;
  disabledText?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onChange, enabledText = 'On', disabledText = 'Off' }) => {
  return (
    <div className="flex items-center space-x-3">
        <button
            type="button"
            className={`${
            enabled ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            role="switch"
            aria-checked={enabled}
            onClick={() => onChange(!enabled)}
        >
            <span
            aria-hidden="true"
            className={`${
                enabled ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
        </button>
        <span className={`text-sm font-medium ${enabled ? 'text-gray-900' : 'text-gray-500'}`}>
            {enabled ? enabledText : disabledText}
        </span>
    </div>
  );
};

export default ToggleSwitch;