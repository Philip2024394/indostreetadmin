import React, { useState, useEffect } from 'react';

interface SqlCopyBlockProps {
    title: string;
    sql: string;
    sqlId: string; // Unique ID for this SQL block to track in localStorage
}

const SqlCopyBlock: React.FC<SqlCopyBlockProps> = ({ title, sql, sqlId }) => {
    const [copied, setCopied] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const storageKey = `copied_sql_${sqlId}`;

    useEffect(() => {
        // Check on mount if this script has been copied before
        if (localStorage.getItem(storageKey)) {
            setIsNew(false);
        } else {
            setIsNew(true);
        }
    }, [storageKey]);


    const handleCopy = () => {
        navigator.clipboard.writeText(sql.trim());
        setCopied(true);
        setIsNew(false); // Change color back to normal
        localStorage.setItem(storageKey, 'true'); // Remember this action
        setTimeout(() => setCopied(false), 2000);
    };

    const headerBgClass = isNew ? 'bg-green-100' : 'bg-gray-100';
    const headerBorderClass = isNew ? 'border-green-300' : 'border-gray-200';
    const headerTextClass = isNew ? 'text-green-900' : 'text-gray-700';

    return (
        <div className={`bg-gray-50 rounded-lg border ${headerBorderClass}`}>
            <div className={`p-3 border-b ${headerBgClass} ${headerBorderClass} flex justify-between items-center`}>
                <h3 className={`font-semibold ${headerTextClass} text-sm`}>{title}</h3>
                <button
                    onClick={handleCopy}
                    className="px-3 py-1 text-xs font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 w-24"
                >
                    {copied ? 'Copied!' : 'Copy SQL'}
                </button>
            </div>
            <div className="p-4 bg-gray-900 text-gray-200 rounded-b-lg overflow-x-auto max-h-64">
                <pre className="text-xs whitespace-pre-wrap font-mono">
                    <code>{sql.trim()}</code>
                </pre>
            </div>
        </div>
    );
};

export default SqlCopyBlock;
