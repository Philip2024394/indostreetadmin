
import React, { useState, useEffect, useCallback } from 'react';
import { User, AdminMessage } from '../../types';
import * as api from '../../services/supabase';
import { XIcon } from './Icons';

interface MessagesModalProps {
  user: User;
  onClose: () => void;
}

const MessagesModal: React.FC<MessagesModalProps> = ({ user, onClose }) => {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
        const data = await api.getMessages();
        if (data) {
            const myMessages = data
                .filter(m => m.recipientId === user.id || m.recipientId === 'all')
                .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
            setMessages(myMessages);
        }
    } catch (error) {
        console.error("Failed to fetch messages:", error);
    } finally {
        setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">Admin Messages</h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-500">Loading messages...</p>
          ) : messages.length > 0 ? (
            messages.map(msg => (
              <div key={msg.id} className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                <p className="text-sm text-gray-800">{msg.content}</p>
                <div className="text-right text-xs text-gray-500 mt-2">
                  <span>{new Date(msg.sentAt).toLocaleString()}</span>
                  {msg.recipientId === 'all' && <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">Broadcast</span>}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">You have no messages.</p>
          )}
        </div>
        <div className="p-4 bg-gray-50 border-t text-center">
            <button onClick={onClose} className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default MessagesModal;