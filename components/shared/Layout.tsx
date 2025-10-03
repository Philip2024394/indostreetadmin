import React, { useState, useEffect } from 'react';
import { User, Role, AdminMessage } from '../../types';
import * as api from '../../services/supabase';
import MessagesModal from './MessagesModal';
import ToggleSwitch from './ToggleSwitch';
import { useContent } from '../../contexts/ContentContext';
import { Editable } from './Editable';
import { LogoutIcon, ShieldCheckIcon, CarIcon, StoreIcon, UserGroupIcon, DocumentTextIcon, DollarSignIcon, ChartBarIcon, BellIcon, LandmarkIcon, ClipboardListIcon, BanknotesIcon, MotorcycleIcon, SparklesIcon, RealCarIcon } from './Icons';

type AdminView = 'applications' | 'partners' | 'financials' | 'analytics' | 'tours' | 'siteContent' | 'renewals' | 'fleet' | 'massage';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  title: string;
  adminView?: AdminView;
  onAdminViewChange?: (view: AdminView) => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, title, adminView, onAdminViewChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<AdminMessage[]>([]);
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
  const { isEditMode, setIsEditMode } = useContent();
  
  const navLinkClasses = "flex items-center px-4 py-2 text-gray-300 rounded-md transition-colors duration-200 hover:bg-gray-700 w-full text-left";
  const activeNavLinkClasses = "bg-gray-700 text-white font-semibold";

  useEffect(() => {
    if (user.role === Role.Admin) return; // No notifications for admin

    const fetchMessages = async () => {
        try {
            const data = await api.getMessages();
            if (data) {
                const myMessages = data.filter(m => m.recipientId === user.id || m.recipientId === 'all');
                const myUnread = myMessages.filter(m => !m.readBy.includes(user.id));
                setUnreadMessages(myUnread);
            }
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [user.id, user.role]);

  const handleOpenMessages = () => {
      setIsMessagesModalOpen(true);
  };
  
  const handleCloseMessages = async () => {
    try {
        // Mark messages as read by updating the backend
        await Promise.all(unreadMessages.map(msg => {
            const newReadBy = [...msg.readBy, user.id];
            return api.updateMessage(msg.id, { readBy: newReadBy });
        }));
    } catch (error) {
        console.error("Failed to mark messages as read:", error);
    }
    setUnreadMessages([]); // Optimistically clear
    setIsMessagesModalOpen(false);
  };

  const AdminNav = () => (
    <>
        <button onClick={() => onAdminViewChange?.('applications')} className={`${navLinkClasses} ${adminView === 'applications' ? activeNavLinkClasses : ''}`}>
          <DocumentTextIcon className="w-5 h-5 mr-3" />
          <Editable editId="layout-nav-applications" type="text" defaultValue="Applications" as="span" />
        </button>
         <button onClick={() => onAdminViewChange?.('partners')} className={`${navLinkClasses} ${adminView === 'partners' ? activeNavLinkClasses : ''}`}>
          <UserGroupIcon className="w-5 h-5 mr-3" />
          <Editable editId="layout-nav-partners" type="text" defaultValue="Partners" as="span" />
        </button>
        <button onClick={() => onAdminViewChange?.('fleet')} className={`${navLinkClasses} ${adminView === 'fleet' ? activeNavLinkClasses : ''}`}>
          <RealCarIcon className="w-5 h-5 mr-3" />
          <Editable editId="layout-nav-fleet" type="text" defaultValue="Fleet Management" as="span" />
        </button>
        <button onClick={() => onAdminViewChange?.('massage')} className={`${navLinkClasses} ${adminView === 'massage' ? activeNavLinkClasses : ''}`}>
            <SparklesIcon className="w-5 h-5 mr-3" />
            <Editable editId="layout-nav-massage" type="text" defaultValue="Massage & Wellness" as="span" />
        </button>
        <button onClick={() => onAdminViewChange?.('renewals')} className={`${navLinkClasses} ${adminView === 'renewals' ? activeNavLinkClasses : ''}`}>
          <BanknotesIcon className="w-5 h-5 mr-3" />
          <Editable editId="layout-nav-renewals" type="text" defaultValue="Renewals" as="span" />
        </button>
        <button onClick={() => onAdminViewChange?.('financials')} className={`${navLinkClasses} ${adminView === 'financials' ? activeNavLinkClasses : ''}`}>
          <DollarSignIcon className="w-5 h-5 mr-3" />
          <Editable editId="layout-nav-financials" type="text" defaultValue="Financials" as="span" />
        </button>
        <button onClick={() => onAdminViewChange?.('analytics')} className={`${navLinkClasses} ${adminView === 'analytics' ? activeNavLinkClasses : ''}`}>
          <ChartBarIcon className="w-5 h-5 mr-3" />
          <Editable editId="layout-nav-analytics" type="text" defaultValue="Analytics" as="span" />
        </button>
        <button onClick={() => onAdminViewChange?.('tours')} className={`${navLinkClasses} ${adminView === 'tours' ? activeNavLinkClasses : ''}`}>
          <LandmarkIcon className="w-5 h-5 mr-3" />
          <Editable editId="layout-nav-tours" type="text" defaultValue="Tours" as="span" />
        </button>
        <button onClick={() => onAdminViewChange?.('siteContent')} className={`${navLinkClasses} ${adminView === 'siteContent' ? activeNavLinkClasses : ''}`}>
          <ClipboardListIcon className="w-5 h-5 mr-3" />
          <Editable editId="layout-nav-site-content" type="text" defaultValue="Site Content" as="span" />
        </button>
    </>
  );

  const DefaultNav = () => (
     <button type="button" className={`${navLinkClasses} ${activeNavLinkClasses}`}>
        Dashboard
      </button>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out z-30 w-64 bg-gray-800 text-white flex flex-col`}>
        <div className="flex items-center justify-center h-20 border-b border-gray-700">
          <h1 className="text-2xl font-bold">
            <Editable editId="layout-app-title" type="text" defaultValue="IndoStreet" as="span" />
          </h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {user.role === Role.Admin ? <AdminNav /> : <DefaultNav />}
        </nav>
        <div className="p-4 border-t border-gray-700 mt-auto">
          <p className="text-sm text-gray-400">Signed in as</p>
          <p className="font-semibold">{user.profile.name || user.email}</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex justify-between md:justify-end items-center p-4 bg-white border-b">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-500 focus:outline-none">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="flex items-center space-x-4">
            {user.role === Role.Admin && (
              <div className="border-r pr-4">
                 <ToggleSwitch enabled={isEditMode} onChange={setIsEditMode} enabledText="Edit Mode" disabledText="Edit Mode" />
              </div>
            )}
            {user.role !== Role.Admin && (
                <button onClick={handleOpenMessages} className="relative text-gray-500 hover:text-gray-700">
                    <BellIcon className="w-6 h-6" />
                    {unreadMessages.length > 0 && (
                        <span className="absolute top-0 right-0 flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">{unreadMessages.length}</span>
                        </span>
                    )}
                </button>
            )}
            <span className="text-gray-700 hidden sm:block">{user.profile.name || user.email}</span>
            <button onClick={onLogout} className="flex items-center text-sm text-gray-600 hover:text-red-500 transition-colors duration-200">
              <LogoutIcon className="w-5 h-5 mr-1" />
              Logout
            </button>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{title}</h2>
            {children}
          </div>
        </main>
      </div>
      {isMessagesModalOpen && <MessagesModal user={user} onClose={handleCloseMessages} />}
    </div>
  );
};

export default Layout;