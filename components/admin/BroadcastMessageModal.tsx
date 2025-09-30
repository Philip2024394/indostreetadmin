import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { XIcon, PaperAirplaneIcon } from '../shared/Icons';

interface BroadcastMessageModalProps {
  onClose: () => void;
}

const BroadcastMessageModal: React.FC<BroadcastMessageModalProps> = ({ onClose }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === '' || isSending) return;

    setIsSending(true);
    const { error } = await supabase.from('admin_messages').insert({
        recipientId: 'all',
        content: message,
    });

    if (error) {
        alert('Failed to send broadcast message.');
        console.error(error);
    } else {
        setIsSent(true);
        setTimeout(() => {
            onClose();
        }, 1500); // Close modal after 1.5s
    }
    setIsSending(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">Broadcast Message to All Partners</h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSend}>
            <div className="p-6">
            <label htmlFor="broadcast-message" className="block text-sm font-medium text-gray-700 mb-2">
                Message Content
            </label>
            <textarea
                id="broadcast-message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Type your announcement or message here..."
                disabled={isSending || isSent}
            />
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end">
            <button
                type="submit"
                disabled={isSending || isSent || message.trim() === ''}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
                {isSent ? (
                    'Message Sent!'
                ) : isSending ? (
                    'Sending...'
                ) : (
                    <>
                        <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                        Send Broadcast
                    </>
                )}
            </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default BroadcastMessageModal;
